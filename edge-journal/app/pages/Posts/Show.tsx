import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../components/Layout";
import type { PageProps } from "../../pages.gen";
import { publishedDate } from "../../../lib/published-date";

type Props = PageProps<"Posts/Show">;

export default function Show({ post, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title={post.title}>
        <meta head-key="description" name="description" content={post.excerpt} />
      </Head>
      <article className="article-page">
        <header className="article-header">
          <Text type="supporting" color="secondary" as="p">
            <time dateTime={post.publishedAt}>{publishedDate(post.publishedAt, "long")}</time>
          </Text>
          <Heading className="article-title" level={1} type="display-2" textWrap="balance">{post.title}</Heading>
          <Text type="large" color="secondary" as="p">{post.excerpt}</Text>
        </header>
        <div className="article-divider" aria-hidden="true" />
        <pre className="article-body">{post.body}</pre>
        <footer className="article-footer">
          <Link href="/" isStandalone hasUnderline>Back to the journal</Link>
        </footer>
      </article>
    </Layout>
  );
}
