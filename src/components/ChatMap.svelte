<script lang="ts">
	// borrowed and fixed from https://svelte.dev/repl/9499dbcf3f3240e4af42e38ab19cc9ea?version=3.47.0

  import { Transformer } from "markmap-lib";
  import * as markmap from "markmap-view";
  import { afterUpdate } from "svelte";
  import YAML from "hexo-front-matter";
	import { getContextualStores } from '../stores/contextual-stores';
  import { BusEvent, Context } from "../services/bus";

	export let guid: string;
	const { treeDisplay, sendMessage } = getContextualStores(guid);

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

	function activate(id: string) {
		console.log(`activate ${id}`);
		sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, {content: `/setThread(${id})` } );
	}

	(window as any).chat_map_activate = activate;

  $: value = $treeDisplay.reduce((md, item ) => {
		return md + `${' '.repeat(item.depth * 2)}- id: ${item.id} - <span onclick="chat_map_activate('${item.id}')">${wrapText((item.summary || ''), 30) || 'no summary'}</span>\n`;
	}, "\n");

  let mindmap: SVGSVGElement;
  let linkSVG: any;
  let show = false;
  
  function replaceMarkdown(md: string) {
    md = md.replace(
      /(?<!#)# (.*)\n/g,
      '# <span style="font-weight:bold; font-size:1.3em; display:block; padding-bottom:0.6em">$1</span>\n'
    );
    md = md.replace(
      /(?<!#)## (.*)\n/g,
      '## <span style="font-weight:bold; font-size:1em; display:block; padding-bottom:0.4em">$1</span>\n'
    );
    //md = md.replace(/(?<!#)## (.*)\n- /g,'## $1\n- <br>');
    //md = md.replace(/\n- /g,'\n- <br>');
    return md;
  }

  $: markdown = replaceMarkdown(
    YAML.parse(value, { separator: "\n---\n" })._content
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
      //style: id => 'div{padding-bottom:0.25em!important} g g:last-of-type div{font-weight:bold; font-size:18px} foreignObject{overflow:visible!important; transform:translateX(-1%)} g g:last-of-type rect {transform:scaleX(125%) translateX(-3%)}',
      //style: id => 'div{padding-bottom:0.3em!important} g g:last-of-type div{font-weight:bold;} foreignObject{overflow:visible!important; transform:translateX(-1%)}',
      duration: 0,
      style: () => "div{padding-bottom:0.12em!important}",
      spacingVertical: 8, // 5
      //spacingHorizontal: 100,
      paddingX: 15, // 8
    };
    mindmap.innerHTML = "";

		setTimeout(() => {
			Markmap.create("#markmap", options, root);
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
      // '" style="width: 100%; height: 983px;">' +
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

  <svg
    id="markmap"
    bind:this={mindmap}
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  ></svg>

<style>
	#markmap {
		width: 100%;
		height: 100%;
	}
</style>