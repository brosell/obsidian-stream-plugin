<script lang="ts">
	// borrowed and fixed from https://svelte.dev/repl/9499dbcf3f3240e4af42e38ab19cc9ea?version=3.47.0

  import { Transformer } from "markmap-lib";
  import * as markmap from "markmap-view";
  import { afterUpdate } from "svelte";
  import YAML from "hexo-front-matter";
	import { getContextualStores } from '../stores/contextual-stores';

	export let guid: string;
	const { treeDisplay } = getContextualStores(guid);

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

  $: value = $treeDisplay.reduce((md, item ) => {
		console.log("item", item);
		return md + `${' '.repeat(item.depth * 2)}- id: ${item.id} - ${wrapText((item.summary || ''), 30) || 'no summary'}` + "\n";
	}, "\n");

  let mindmap: any;
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
  );

  afterUpdate(() => {
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
    Markmap.create("#markmap", options, root);
    linkSVG = makeTextFile(createSVG(mindmap));
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
  div {
    display: flex;
  }

	svg {
		transform: rotate(90deg);
		width: 150%; 
		height: 100%;
	}
</style>
