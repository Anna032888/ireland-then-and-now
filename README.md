# Ireland: Then & Now — the plain HTML version

This folder is a complete, ready-to-publish website. No build tools, no npm,
no framework: just .html files, one stylesheet and two folders of images.

One small script comes with it — `scroll-spy.js` — which slides the green dot
in the "in this section" rail to the section you are reading. Only the pages
that have that rail load it; everything else is plain HTML. Delete the file and
the rail still works, it simply stops following you.

## How to put it on GitHub Pages

1. Go to the repository that will host it (for example
   `https://github.com/Anna032888/RepublicOfIreland`) and click **Add file → Upload files**.
2. Drag **everything inside this folder** into the upload box — including the
   `img` and `archive` folders and the hidden `.nojekyll` file.
   Do not upload the folder itself; upload its contents.
3. Commit the changes.
4. In the repository, open **Settings → Pages**. Under *Source*, choose
   **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder,
   then **Save**.
5. Wait a minute or two. Your site will be at
   `https://<your-username>.github.io/<repository-name>/`.

## What is in here

| File | What it is |
| --- | --- |
| `index.html` | Homepage (English) |
| `ru-index.html` | Homepage (Russian) |
| `explore.html` | All 30 places, grouped |
| `landscapes.html`, `heritage.html`, `cities.html` | The three categories |
| `place-<name>.html` | One page per place |
| `history.html`, `culture.html`, `geography.html`, `today.html`, `plan.html` | The long-form sections |
| `original.html` | About the 2005 original |
| `case-study.html` | How the site was rebuilt |
| `sitemap.html` | Every page of the site, in one place |
| `credits.html` | Photo credits and licences |
| Every `ru-*.html` | The Russian version of the page with the same name |
| `styles.css` | The whole design, one file |
| `scroll-spy.js` | Moves the dot in the "in this section" rail |
| `sitemap.xml`, `robots.txt` | For search engines — not needed to view the site |
| `img/` | Every photograph used by the site |
| `archive/` | **The 2005 website, unchanged** — `archive/index.htm` |

## Editing it by hand

Every page is one file. Open it in any text editor, change the words between
the tags, save, refresh. Nothing needs to be rebuilt.

- The look lives entirely in `styles.css`. The colours are the block at the
  very top (`--ie-navy`, `--ie-green`, `--ie-gold`, `--ie-cream`).
- To swap a photograph, replace the file in `img/` with one of the same name
  and roughly the same shape. Nothing else needs to change.
- Delete a page and other pages will still link to it. If you remove a page,
  also remove its `<a href="...">` links. A quick search for the filename will
  find them.

Photographs come from Wikimedia Commons under the licences listed on
`credits.html` — keep that page, and keep the photographer's name with the
photo if you reuse it elsewhere.
