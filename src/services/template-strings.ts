
export const tStringConstructor = <T extends Record<string, any>>(template: string) => {
  return (params: T) => constructTemplateString(template, params); //.replace(/ +/g, ' ').replace(/\n+/g, '\n').trim();
}

function constructTemplateString(templateString: string, params: Record<string, string>): string {
  return templateString.replace(/{{(.*?)}}/g, (match, token) => {
    return params[token.trim()] || match;
  });
}