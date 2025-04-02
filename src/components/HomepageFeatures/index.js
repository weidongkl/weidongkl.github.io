import clsx from 'clsx';
import Link from "@docusaurus/Link";
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function HomepageFeatures() {
    const Svg = require('@site/static/img/index/user3.svg').default;
    return (
        <section className={styles.features}>
            <div className={clsx('col col--6')}>
                <div className="text--center">
                    <Svg className={styles.featureSvg} role="img"/>
                </div>
            </div>

            <div className="text--left padding-horiz--md">
                <h2>笔迹·知行</h2>
                <p>笔记不仅能帮助我们整理思路、加深理解，还能积累个人知识，避免遗忘。<br/>
                    同时，书写的过程还能激发新思考，让成长清晰可见。</p>
                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to='/docs/category/golang'>
                        查看笔记
                    </Link>
                </div>
            </div>
        </section>
    );
}
