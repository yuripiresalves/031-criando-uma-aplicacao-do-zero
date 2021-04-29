import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="" className={styles.banner} />

      <main className={commonStyles.mainContainer}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <time>4 min</time>
          </div>

          {post.data.content.map(section => {
            return (
              <section className={styles.content}>
                <h2>{section.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.body }} />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  // console.log(response.data.content[0].body);

  const content = response.data.content.map(item => {
    return {
      heading: item.heading,
      body: RichText.asHtml(item.body),
      // item.body.map(obj => obj.text)
    };
  });

  // console.log(content);

  return {
    props: {
      post: {
        first_publication_date: format(
          new Date(response.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: response.data.title,
          banner: {
            url: response.data.banner.url,
          },
          author: response.data.author,
          content,
        },
      },
    },
  };
};
