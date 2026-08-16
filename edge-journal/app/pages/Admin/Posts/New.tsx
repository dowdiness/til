import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../../components/Layout";
import { PostForm } from "../../../components/PostForm";
import type { PageProps } from "../../../pages.gen";

type Props = PageProps<"Admin/Posts/New">;

export default function New({ initial, errors, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title="New post" />
      <section className="form-page">
        <header className="form-heading">
          <Heading level={1} type="display-3">New post</Heading>
          <Text type="large" color="secondary" as="p">Write now, choose when it becomes public.</Text>
        </header>
        <PostForm action="create" initial={initial} errors={errors} />
      </section>
    </Layout>
  );
}
