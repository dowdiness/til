import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../components/Layout";
import { astryxOverrides } from "../../styles/astryx-overrides.stylex";
import { textHoverHandlers } from "../../styles/text-hover";
import type { PageProps } from "../../pages.gen";
import { articleBodyParagraphs } from "../../../lib/article-body";
import { publishedDate } from "../../../lib/published-date";

type Props = PageProps<"Posts/Show">;

export default function Show({ post, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title={post.title}>
        <meta head-key="description" name="description" content={post.excerpt} />
      </Head>
      <article className="mx-auto max-w-reading">
        <header className="pb-8">
          <Text type="supporting" color="secondary" as="p" xstyle={astryxOverrides.articleMeta}>
            <time dateTime={post.publishedAt}>{publishedDate(post.publishedAt, "long")}</time>
          </Text>
          <Heading
            level={1}
            type="display-2"
            textWrap="balance"
            xstyle={astryxOverrides.articleTitle}
          >
            {post.title}
          </Heading>
          <Text type="large" color="secondary" as="p" xstyle={astryxOverrides.articleLead}>{post.excerpt}</Text>
        </header>
        <div className="mb-11 h-px w-12 bg-divider" aria-hidden="true" />
        <div className="max-w-prose text-primary">
          {articleBodyParagraphs(post.body).map((paragraph, index) => (
            <p
              className={`${index === 0 ? "mt-0" : "mt-[1.8em]"} mb-0 whitespace-pre-wrap text-pretty wrap-anywhere text-article`}
              key={index}
            >
              {paragraph}
            </p>
          ))}
        </div>
        <footer className="mt-16 border-t border-dotted border-rule pt-4 text-sm contrast-more:border-solid contrast-more:border-secondary">
          <Link
            href="/"
            isStandalone
            hasUnderline
            className="text-hover-link"
            xstyle={astryxOverrides.textLink}
            {...textHoverHandlers}
          >
            Back to the journal
          </Link>
        </footer>
      </article>
    </Layout>
  );
}
