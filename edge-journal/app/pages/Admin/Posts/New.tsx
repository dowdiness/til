import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Head } from "@inertiajs/react";
import { Layout } from "../../../components/Layout";
import { PostForm } from "../../../components/PostForm";
import type { PageProps } from "../../../pages.gen";
import { astryxOverrides } from "../../../styles/astryx-overrides.stylex";

type Props = PageProps<"Admin/Posts/New">;

export default function New({ initial, errors, flash }: Props) {
  return (
    <Layout flash={flash}>
      <Head title="New post" />
      <section className="mx-auto max-w-reading">
        <header className="mb-12">
          <Heading level={1} type="display-3" xstyle={astryxOverrides.pageHeading}>New post</Heading>
          <Text type="large" color="secondary" as="p" xstyle={astryxOverrides.formLead}>Write now, choose when it becomes public.</Text>
        </header>
        <PostForm action="create" initial={initial} errors={errors} />
      </section>
    </Layout>
  );
}
