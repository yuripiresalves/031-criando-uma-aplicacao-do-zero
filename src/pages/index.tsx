import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState([...postsPagination.results]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts() {
    const response = await fetch(nextPage);
    const json = await response.json();

    const loadedPosts = json.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          { locale: ptBr }
        ),
      };
    });

    setPosts([...posts, ...loadedPosts]);
    setNextPage(json.next_page);
  }

  return (
    <div className={commonStyles.mainContainer}>
      <header className={styles.header}>
        <img src="/Logo.svg" alt="logo" />
      </header>

      {posts.map(post => {
        return (
          <Link href={`/post/${post.uid}`}>
            <section key={post.uid} className={styles.post}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>

              <div className={styles.info}>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </section>
          </Link>
        );
      })}

      {nextPage && (
        <button type="button" className={styles.button} onClick={loadMorePosts}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBr,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};
