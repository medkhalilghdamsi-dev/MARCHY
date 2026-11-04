import { Children, cloneElement, isValidElement } from 'react'
import { translations } from './translations'


function translateText(value, lang) {
  const trimmed = value.trim();
  const entry = translations[trimmed];
  if (!entry || lang === "en") return value;
  return value.replace(trimmed, entry[lang === "fr" ? 0 : 1]);
}
function translateTree(node, lang) {
  if (typeof node === "string") return translateText(node, lang);
  if (Array.isArray(node)) return node.map(child => translateTree(child, lang));
  if (!isValidElement(node)) return node;
  const props = {...node.props};
  if (props.children !== undefined) props.children = Children.map(props.children, child => translateTree(child, lang));
  for (const attr of ["placeholder", "aria-label", "title"]) if (typeof props[attr] === "string") props[attr] = translateText(props[attr], lang);
  return cloneElement(node, props);
}

export { translateText, translateTree }
