import clsx from 'clsx';
import Link from "@docusaurus/Link";
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  // {
  //   title: 'book',
  //   Svg: require('@site/static/img/c_book.svg').default,
  //   description: (
  //     <>
  //         Reading Record.
  //     </>
  //   ),
  //   link: '/docs/book/yuhua',
  //   label: '读书笔记',
  // },
  {
    title: 'note',
    Svg: require('@site/static/img/c_note.svg').default,
    description: (
      <>
          记录学习过程中的笔记、问题解决的记录。
      </>
    ),
    link: '/docs/note/intro',
    label: '笔记',
  },
    {
      title: 'blog',
      Svg: require('@site/static/img/c_blog.svg').default,
      description: (
      <>
        随手记。
      </>
      ),
      link: '/blog',
      label: '博客',
    },
];

function Feature({Svg, title, description, link, label}) {
    return (
        <div className={clsx('col col--6')}> 
        {/* 用6/12 * 100% 这样计算的 */}
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img"/>
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">
                    <div className={styles.buttons}>
                        <Link
                            className="button button--secondary button--lg"
                            to={link}>
                            {label}
                        </Link>
                    </div>
                </Heading>
                {/*<p>{description}</p>*/}
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
