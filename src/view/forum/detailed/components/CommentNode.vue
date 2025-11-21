<script lang="ts">
import {
  defineComponent,
  h,
  resolveComponent,
  type PropType,
  type VNode,
} from "vue";
import type { ForumComment } from "@/mocks/schema/forum.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowBigUp, Pin, Lock } from "lucide-vue-next";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});
function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  for (const [unit, amountMs] of ranges) {
    const delta = diffMs / amountMs;
    if (Math.abs(delta) >= 1)
      return relativeTimeFormatter.format(Math.round(delta), unit);
  }
  return "just now";
}

export default defineComponent({
  name: "CommentNode",
  props: {
    comment: { type: Object as PropType<ForumComment>, required: true },
  },
  setup(props): () => VNode {
    return () =>
      h("li", { class: "space-y-2" }, [
        h("div", { class: "flex items-start gap-3" }, [
          h(
            Avatar,
            { class: "h-7 w-7 border border-border/50" },
            {
              default: () => [
                props.comment.author.avatar
                  ? h(AvatarImage, {
                      src: props.comment.author.avatar,
                      alt: props.comment.author.username,
                    })
                  : h(
                      AvatarFallback,
                      { class: "text-[10px] font-semibold uppercase" },
                      {
                        default: () =>
                          props.comment.author.username
                            .slice(0, 2)
                            .toUpperCase(),
                      },
                    ),
              ],
            },
          ),
          h("div", { class: "min-w-0 flex-1 space-y-1" }, [
            h(
              "div",
              {
                class:
                  "flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground",
              },
              [
                h(
                  "span",
                  { class: "font-semibold text-foreground" },
                  `u/${props.comment.author.username}`,
                ),
                h("span", null, "•"),
                h("span", null, formatRelativeTime(props.comment.createdAt)),
                props.comment.isPinned
                  ? h(
                      "span",
                      {
                        class:
                          "inline-flex items-center gap-1 text-emerald-700",
                      },
                      [h(Pin, { class: "h-3 w-3" }), " Pinned"],
                    )
                  : null,
                props.comment.isLocked
                  ? h(
                      "span",
                      {
                        class: "inline-flex items-center gap-1 text-amber-700",
                      },
                      [h(Lock, { class: "h-3 w-3" }), " Locked"],
                    )
                  : null,
              ],
            ),
            h("p", { class: "text-sm text-foreground" }, props.comment.body),
            h(
              "div",
              {
                class:
                  "flex items-center gap-3 text-[11px] text-muted-foreground",
              },
              [
                h("span", { class: "inline-flex items-center gap-1" }, [
                  h(ArrowBigUp, { class: "h-3 w-3" }),
                  ` ${props.comment.upvotes}`,
                ]),
              ],
            ),
          ]),
        ]),
        props.comment.replies && props.comment.replies.length
          ? h(
              "ul",
              { class: "ml-6 border-l border-border/40 pl-4" },
              props.comment.replies.map((child) =>
                h(resolveComponent("CommentNode"), {
                  comment: child,
                  key: child.id,
                }),
              ),
            )
          : null,
      ]);
  },
});
</script>
