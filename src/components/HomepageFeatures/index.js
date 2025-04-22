import clsx from 'clsx';
import Link from "@docusaurus/Link";
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import recentDocs from "../../data/recentDocs.json";
import React from "react";

export default function HomepageFeatures() {
    const Svg = require('@site/static/img/index/user3.svg').default;
    return (

        <section className={styles.features}>
            <div className={styles.flexContainer}>
                <div className={clsx('col col--6', styles.imageSection)}>
                    <div className="text--center">
                        <Svg className={styles.featureSvg} role="img"/>
                    </div>
                </div>
                <div className={clsx('col col--6', styles.textSection)}>
                    <div className="text--left padding-horiz--md">
                        <Heading as="h2" className="text-2xl  mb-4">笔迹 · 知行</Heading>
                        {/*<p>笔记不仅能帮助我们整理思路、加深理解，还能积累个人知识，避免遗忘。<br/>*/}
                        {/*    同时，书写的过程还能激发新思考，让成长清晰可见。</p>*/}
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            笔记不仅能帮助我们整理思路、加深理解，还能积累个人知识，避免遗忘。<br />
                            同时，书写的过程还能激发新思考，让成长清晰可见。
                        </p>
                        <Link
                            to="/docs"
                        >
                            📚 查看全部笔记
                        </Link>
                        {/*<div className="bg-gray-100 p-4 rounded-xl shadow-md mt-6 w-full max-w-xl">*/}
                        {/*    <h3 className="text-2xl mb-2">📌 最近更新</h3>*/}
                        {/*    <ul className="animate-fade-in-down transition-all duration-300 ">*/}
                        {/*        {recentDocs.map((doc, index) => (*/}
                        {/*            <li key={index}>*/}
                        {/*                <Link to={`/docs/${doc.path}`} className="text-blue-600 hover:underline">*/}
                        {/*                    {doc.title}*/}
                        {/*                </Link>*/}
                        {/*            </li>*/}
                        {/*        ))}*/}
                        {/*    </ul>*/}
                        {/*</div>*/}
                    </div>
                </div>

            </div>
        </section>
    );
}
