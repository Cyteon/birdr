import { marked } from "marked";
import DOMPurify from "dompurify";

export function parsePost(text: string, clip = true, url = "") {
  if (text.split("\n").length > 5 && clip) {
    text = text.split("\n").slice(0, 5).join("\n");
    text += ` ... <a href="${url}">Read more</a>`;
  }

  if (text.length > 500 && clip) {
    text = text.slice(0, 500) + ` ... <a href="${url}">Read more</a>`;
  }

  let parsed = DOMPurify.sanitize(marked(text) as string);

  return parsed;
}

export function createTimeString(str: string) {
  let now = new Date();
  let date = new Date(str);

  let diff = now.getTime() - date.getTime();

  if (diff < 1000) {
    return "Just now";
  }

  if (diff < 60000) {
    return `${Math.floor(diff / 1000)}s ago`;
  }

  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  }

  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  }

  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  if (diff < 2592000000) {
    return `${Math.floor(diff / 604800000)}w ago`;
  }

  if (diff < 31536000000) {
    return `${Math.floor(diff / 2592000000)}mo ago`;
  }

  return `${Math.floor(diff / 31536000000)}y ago`;
}
