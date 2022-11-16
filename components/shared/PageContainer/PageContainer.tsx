import Head from "next/head";
import React from "react";
import * as styles from "./PageContainer.css";

export const PageContainer = ({
  children,
  title,
}: {
  children: React.ReactElement;
  title: string;
}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={styles.body}>{children}</div>
    </div>
  );
};
