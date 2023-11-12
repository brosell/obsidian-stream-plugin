import { writable, derived } from "svelte/store";
import {marked} from 'marked';


export const markdown = writable('# Markdown');

export const renderedHtml = derived(markdown, markdown => marked(markdown))