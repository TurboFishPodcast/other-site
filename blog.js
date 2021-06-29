import { ago } from "./ago.js";
const api = "https://respdev-blog.deno.dev";
const slug = window.location.hash.substr(1).length > 0
    ? window.location.hash.substr(1)
    : undefined;
// show posts
if (!slug) {
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
    let nextPage = 0;
    let loadingMore = false;
    async function loadMore() {
        if (nextPage === null)
            return;
        let res;
        loadingMore = true;
        try {
            res = await fetch(`${api}/page/${nextPage++}`);
            const page = await res.json();
            if (!page.next)
                nextPage = null;
            for (const post of page.posts) {
                const title = post.title;
                const authors = post.authors;
                const date = ago(new Date(post.date));
                const description = post.description;
                const slug = post.slug;
                document.getElementById("posts").innerHTML += `
          <div class="post">
            <h3><a href="blog.html#${slug}" target="blank">${title}</a></h3>
            <p><small>${`
              By
                ${authors.map(({ name, link }) => `${link ? `<a href="${link}">` : ""}${name}${link ? `</a>` : ""}`).join(", ")}
                &bullet;
                (<i>${date}</i>)
              `}
            </small></p>
            <p>${description}</p>
          </div>
        `;
            }
        }
        catch {
            // no page with this number
            if (res.status === 400) {
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
        const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
        const scrollTop = window.pageYOffset
            ?? (document.documentElement ?? document.parentNode ?? document.body)
                .scrollTop;
        let scroll = scrollTop / (documentHeight - windowHeight);
        if (!loadingMore && scroll > 0.8)
            loadMore();
    });
    if (!loadingMore)
        loadMore();
}
// show specific post
else {
    let res;
    try {
        res = await fetch(`${api}/post/${slug}`);
        const post = await res.json();
        const title = post.title;
        const authors = post.authors;
        const date = ago(new Date(post.date));
        const description = post.description;
        // @ts-expect-error
        const reader = new commonmark.Parser();
        // @ts-expect-error
        const writer = new commonmark.HtmlRenderer();
        const content = writer.render(reader.parse(post.content));
        document.getElementById("title").innerText = title;
        document.getElementById("desc").innerText = description;
        document.getElementById("by").innerHTML = `
      By
      ${authors.map(({ name, link }) => `${link ? `<a href="${link}">` : ""}${name}${link ? `</a>` : ""}`).join(", ")}
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
    }
    catch {
        // no post with this slug
        if (res.status === 400) {
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
//# sourceMappingURL=blog.js.map