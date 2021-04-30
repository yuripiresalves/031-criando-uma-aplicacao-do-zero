import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="" className={styles.banner} />

      <main className={commonStyles.mainContainer}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <time style={{ textTransform: 'capitalize' }}>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <time>4 min</time>
          </div>

          {post.data.content.map(section => {
            return (
              <section className={styles.content} key={section.heading}>
                <h2>{section.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: {
        first_publication_date: response.first_publication_date,
        uid: response.uid,
        data: {
          subtitle: response.data.subtitle,
          title: response.data.title,
          banner: {
            url: response.data.banner.url,
          },
          author: response.data.author,
          content: response.data.content.map(({ heading, body }) => {
            return {
              heading,
              body: body,
            };
          }),
        },
        // response,
      },
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
