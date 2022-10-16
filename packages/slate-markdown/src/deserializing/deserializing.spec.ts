import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkToSlate } from "remark-slate-transformer";
import remarkFrontmatter from "remark-frontmatter";
import type mdast from "mdast";

type a = mdast.Content["type"];

declare module "mdast" {
  interface FrontmatterContentMap {
    json: JSON;
  }
}

export interface JSON extends mdast.Literal {
  type: "json";
}

const buildJson = ({ type, value }: JSON) => {
  return {
    type,
    children: [{ text: value }],
  };
};

describe("frontmatter", () => {
  test("yaml", () => {
    const vFile = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["yaml"])
      .use(remarkToSlate)
      .processSync("---\nkey: value\n---");

    expect(vFile.result).toEqual([
      {
        type: "yaml",
        children: [
          {
            text: "key: value",
          },
        ],
      },
    ]);
  });

  test("toml", () => {
    const vFile = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["toml"])
      .use(remarkToSlate)
      .processSync("+++\nkey: value\n+++");

    expect(vFile.result).toEqual([
      {
        type: "toml",
        children: [
          {
            text: "key: value",
          },
        ],
      },
    ]);
  });

  test("json", () => {
    const vFile = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, [
        { type: "json", fence: { open: "{", close: "}" } },
      ])
      .use(remarkToSlate, {
        overrides: {
          json: buildJson,
        },
      })
      .processSync("{\nkey: value\n}");

    expect(vFile.result).toEqual([
      {
        type: "json",
        children: [
          {
            text: "key: value",
          },
        ],
      },
    ]);
  });
});
