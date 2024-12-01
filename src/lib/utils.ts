import { marked } from "marked";
import DOMPurify from "dompurify";

export function parsePost(post, clip = true, url = "") {
  let text = post.content;

  if (text.split("\n").length > 5 && clip) {
    text = text.split("\n").slice(0, 5).join("\n");
    text += ` ... <a href="${url}">Read more</a>`;
  }

  if (text.length > 500 && clip) {
    text = text.slice(0, 500) + ` ... <a href="${url}">Read more</a>`;
  }

  let mentions = text.match(/@(\w+)/g);

  if (mentions) {
    for (let mention of mentions) {
      let mentionData = post.mentions[mention];

      if (mentionData) {
        text = text.replace(
          mention,
          `<a href="/${mention}" class="no-underline">@${mentionData.displayName || mention.slice(1)}</a>`,
        );
      }
    }
  }

  const links = post.content.match(/https?:\/\/[^\s]+/g);
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const videoExtensions = ["mp4", "webm"];
  let doneEmbeds = [];
  let embedded = 0;

  if (links) {
    for (let link of links) {
      if (embedded >= 2 && clip) {
        text += ` ... <a href="${url}">Read more</a>`;
        break;
      }

      const extension = link.split(".").pop().toLowerCase().split("?")[0];

      if (imageExtensions.includes(extension)) {
        text = text.replace(
          link,
          `<img src="${link}" alt="Image" class="post-image" />`,
        );
      } else if (videoExtensions.includes(extension)) {
        text = text.replace(
          link,
          `<video src="${link}" controls class="post-video" />`,
        );
      }

      if (post.ogData[link.replace(".", "_-_")] && !doneEmbeds.includes(link)) {
        const ogData = post.ogData[link.replace(".", "_-_")];

        let image = ogData.ogImage[0];

        text += 
          `<div class="bg-ctp-mantle p-2 mb-1 size-fit rounded-md max-w-xl border border-ctp-surface0">
            <a class="text-xl font-bold m-0" href="${ogData.url}">${ogData.ogTitle}</a>
            <p class="m-0 text-sm">${ogData.ogDescription}</p>
            <img src="${image.url}" alt="${ogData.ogTitle}" class="post-image mb-0 mt-1" width="256" />
          </div>
        `;

        doneEmbeds.push(link);
      }

      embedded++;
    }
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
