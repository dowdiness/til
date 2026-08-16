import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../../components/Layout";
import { PostForm } from "../../../components/PostForm";
import type { PageProps } from "../../../pages.gen";

type Props = PageProps<"Admin/Posts/Edit">;

export default function Edit({ post, errors, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title={`Edit ${post.title}`} />
      <section className="form-page">
        <header className="form-heading">
          <div className="form-title-row">
            <Heading level={1} type="display-3">Edit post</Heading>
            <span className={`post-status post-status--${post.status}`}>{post.status}</span>
          </div>
          <Text type="large" color="secondary" as="p">Changes keep the original publication date unless the status changes.</Text>
        </header>
        <PostForm action="edit" initial={post} errors={errors} />
      </section>
    </Layout>
  );
}
