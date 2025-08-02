"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Link href="/datawhale/project">
        <div className={styles.link}>
          <h2>Datawhale超过1000Star项目的Star数</h2>
        </div>
      </Link>
      <Link href="/datawhale/projectAdd">
        <div className={styles.link}>
          <h2>Datawhale超过1000Star项目的本年度Star增长数</h2>
        </div>
      </Link>
      <Link href="/datawhale/projectAddTop5">
        <div className={styles.link}>
          <h2>Datawhale项目本年度Star增长数Top5</h2>
        </div>
      </Link>
      <Link href="/datawhale/newProjectAddTop3">
        <div className={styles.link}>
          <h2>Datawhale新创建的项目Star增长数Top3</h2>
        </div>
      </Link>
      <Link href="/organization/rank">
        <div className={styles.link}>
          <h2>GitHub知识分享类组织Star数总排名</h2>
        </div>
      </Link>
      <Link href="/organization/innerRank">
        <div className={styles.link}>
          <h2>GitHub知识分享类组织Star数排名</h2>
        </div>
      </Link>
    </div>
  );
}
