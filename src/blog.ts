import { ago } from "./ago.js";
import { JsonFeedInit, JsonFeedItem } from "./types.js";

// export type PostMeta = {
//   title: string;
//   description: string;
//   date: string;
//   authors: {
//     name: string;
//     link?: string;
//   }[];
//   draft?: boolean;
//   slug: string;
//   content: string;
// };

// export type Page = {
//   posts: PostMeta[],
//   next?: string;
//   prev?: string;
// };

// const api = "https://respdev-blog.deno.dev";

const api = "https://responsivedev.github.io/blog/dist";

const id = (new URLSearchParams(window.location.search))
  .get("post");

async function run() {
  // show feeds
  if(!id) {
    document.getElementsByTagName("main")[0].innerHTML += `
      <section>
        <h2>Extra</h2>

        <p>
          The <b>blog</b> is a great way for all of us to share bits of info
          that we lean about. We will be adding posts as the <b>community</b>
          evolves but if you have an idea for a blog post then head over to the
          <a href="https://github.com/ResponsiveDev/blog/">blog repo</a> and
          have fun!
        </p>
      </section>

      <section>
        <h2>Posts</h2>

        <div id="posts"></div>
      </section>
    `;

    let nextFeed: string | null = `${api}/feed-0.json`;
    let loadingMore = false;

    async function loadMore() {
      if(nextFeed === null) return;
      let res: Response;

      loadingMore = true;

      try {
        res = await fetch(nextFeed);
        const feed = await res.json() as JsonFeedInit;

        if(!feed.next_url) nextFeed = null;
        else nextFeed = feed.next_url;

        for(let i = feed.items.length - 1; i >= 0; i--) {
          const item = feed.items[i];

          const title = item.title;
          const authors = item.authors;
          const date = ago(new Date(item.date_published));
          const description = item.summary;
          const slug = item.id;

          document.getElementById("posts")!.innerHTML += `
            <div class="post">
              <h3><a href="blog.html?post=${slug}">${title}</a></h3>
              <p><small>${`
                By
                  ${(authors ?? feed.authors!).map(
                    ({ name, url }) => `${
                      url ? `<a href="${url}">` : ""
                    }${name}${
                      url ? `</a>` : ""
                    }`
                  ).join(", ")}
                  &bullet;
                  (<i>${date}</i>)
                `}
              </small></p>
              <p>${description}</p>
            </div>
          `;
        }
      } catch {
        // no page with this number
        if(res!.status === 400) {
          document.getElementsByTagName("main")[0].innerHTML += `
            <p>Looks like this isn't a page.</p>
          `;
        }
        // other error
        else {
          document.getElementsByTagName("main")[0].innerHTML += `
            <p>This page may exist, but something else failed.</p>
          `;
        }
      }
    }

    document.addEventListener("scroll", () => {
      const windowHeight = window.innerHeight
        ?? (document.documentElement ?? document.body).clientHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      const scrollTop = window.pageYOffset
        ?? (document.documentElement ?? document.parentNode ?? document.body)
          .scrollTop;

      let scroll = scrollTop / (documentHeight - windowHeight);

      if(!loadingMore && scroll > 0.8) loadMore();
    });

    if(!loadingMore) loadMore();
  }
  // show specific item
  else {
    let res: Response;

    try {
      res = await fetch(`${api}/${id}.json`);
      const item = await res.json() as JsonFeedItem;

      const title = item.title;
      const authors = item.authors;
      const date = ago(new Date(item.date_published));
      const description = item.summary;
      
      // @ts-expect-error
      const reader = new commonmark.Parser();
      // @ts-expect-error
      const writer = new commonmark.HtmlRenderer();

      const content = writer.render(reader.parse(item.content_html));

      document.getElementById("title")!.innerText = title;
      document.getElementById("desc")!.innerText = description;
      document.getElementById("by")!.innerHTML = `
        By
        ${authors?.map(
          ({ name, url }) => `${
            url ? `<a href="${url}">` : ""
          }${name}${
            url ? `</a>` : ""
          }`
        ).join(", ")}
        &bullet;
        (<i>${date}</i>)
      `;

      document.getElementsByTagName("main")[0].innerHTML += `
        <section>
          <a href="blog.html"><< back</a>

          <br><br>

          ${content}
        </section>
      `;
    } catch {
      // no post with this slug
      if(res!.status === 400) {
        document.getElementsByTagName("main")[0].innerHTML += `
          <a href="blog.html"><< back</a>
          <p>Looks like no post with that name exists.</p>
        `;
      }
      // other error
      else {
        document.getElementsByTagName("main")[0].innerHTML += `
          <a href="blog.html"><< back</a>
          <p>This post may exist, but something else failed.</p>
        `;
      }
    }
  }
}

run();