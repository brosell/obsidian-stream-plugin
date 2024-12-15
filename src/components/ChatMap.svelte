<script lang="ts">
	// borrowed and fixed from https://svelte.dev/repl/9499dbcf3f3240e4af42e38ab19cc9ea?version=3.47.0

  import { Transformer } from "markmap-lib";
  import * as markmap from "markmap-view";
  import { afterUpdate } from "svelte";
  import YAML from "hexo-front-matter";
	import { getContextualStores } from '../stores/contextual-stores';
  import type { ChatPointDisplay } from "../services/nested-list-builder";
  import { merge, skip, debounceTime, map, take, tap, combineLatest } from "rxjs";

	export let guid: string;
  
	const { findInput, treeDisplay, activeChatThread, activeChatPointId } = getContextualStores(guid);

  const debouncedTree = merge( 
    treeDisplay.pipe(take(1)),
    treeDisplay.pipe(
      skip(1),
      debounceTime(250),
    )
  ).pipe(
    tap(() => console.log('debounced tree', Date.now()))
  )

  const throttledChatThreadIds = merge( 
    activeChatThread.pipe(take(1)),
    activeChatThread.pipe(
      skip(1),
      debounceTime(250),
    )
  ).pipe(
    map(cps => cps.map(cp => cp.id)),
    tap(() => console.log('debounced active thread ids', Date.now())),
  )

	function wrapText(text: string, maxLineLength: number) {
		const words = text.split(/\s+/);
		const lines = [];
		let currentLine = "";

		words.forEach((word) => {
			if ((currentLine + word).length > maxLineLength) {
				lines.push(currentLine.trim());
				currentLine = "";
			}
			currentLine += word + ' ';
		});

		if (currentLine) {
			lines.push(currentLine.trim());
		}

		return lines.join('\n');
	}

  const getStyle = (cpd: ChatPointDisplay, activeNodeIds: string[]) => {
    const isActive=activeNodeIds.some(cp => cp === cpd.id);
    const isFindTermFound = cpd.termFound;
    const style = isFindTermFound ? "background-color:lightblue" : isActive ? "background-color:pink" : '';
    return style;
  }

  const value = combineLatest([
    debouncedTree,
    throttledChatThreadIds,
    activeChatPointId,
  ]).pipe(
    map(([tree, activeIds]) => tree.reduce((md, item ) => {
      return md + `${' '.repeat(item.depth * 2)}- id: ${item.id} ${
        item.chatPoint.selected ? '<span style="font-size:20px; color:white; background-color:black;"> &#x1F31F; </span></p>' : ''
      } - <span title="${
        (item.chatPoint.summary || '').replaceAll('"', '')
      }" style="${getStyle(item, activeIds)}" onclick="chat_map_activate('${guid}','${item.id}')">${wrapText((item.chatPoint.summary || ''), 30) || 'no summary'}</span>\n`;
    }, "\n"))
  );

  let mindmap: SVGSVGElement;
  let linkSVG: any;
  
  function replaceMarkdown(md: string) {
    md = md.replace(
      /(?<!#)# (.*)\n/g,
      '# <span style="font-weight:bold; font-size:1.3em; display:block; padding-bottom:0.6em">$1</span>\n'
    );
    md = md.replace(
      /(?<!#)## (.*)\n/g,
      '## <span style="font-weight:bold; font-size:1em; display:block; padding-bottom:0.4em">$1</span>\n'
    );
    return md;
  }

  $: markdown = replaceMarkdown(
    YAML.parse($value, { separator: "\n---\n" })._content
  ) || '# nada';

  afterUpdate(() => {
		console.log("afterUpdate");
    const transformer = new Transformer();

    const { root, features } = transformer.transform(markdown);
    const { styles, scripts } = transformer.getUsedAssets(features);
    const { Markmap, loadCSS, loadJS } = markmap;

    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => markmap });

    const options = {
      duration: 0,
      style: () => "div{padding-bottom:0.12em!important}",
      spacingVertical: 8, // 5
      paddingX: 15, // 8
    };
    mindmap.innerHTML = "";

		setTimeout(() => {
			Markmap.create(`#markmap-${guid}`, options, root);
			linkSVG = makeTextFile(createSVG(mindmap));
		});
  });

  
  function createSVG(mm: any) {
    mm = mm.innerHTML;
    mm = mm.replace(/<br>/g, "<br/>");
    mm = mm.replace(/\n/g, " ");
    mm =
      '<svg id="markmap" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="' +
      mindmap.className["baseVal"] +
      mm +
      "</svg>";
    return mm;
  }

	let textFile: string;
  function makeTextFile(text: string) {
    const data = new Blob([text], { type: "text/plain" });
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  }
</script>

<input
  class="w-quarter p-2 border-t border-gray-300 resize-y"
  placeholder="Find..."
  bind:value={$findInput}
  style="max-height: 33%;" 
/>
  <svg
    id="markmap-{guid}"
    class="markmap"
    bind:this={mindmap}
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  ></svg>

<style>
	.markmap {
		width: 100%;
		height: 100%;
	}

  .active {
    background-color: #f0f0f0;
  }
</style>