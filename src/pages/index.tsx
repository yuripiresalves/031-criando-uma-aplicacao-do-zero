import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';

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
  const [hasMorePosts, sethasMorePosts] = useState(false);

  async function loadMorePosts() {
    const response = await fetch(`${postsPagination.next_page}`);
    const json = await response.json();
    console.log(json);

    postsPagination.results.push(json.results[0]);
    sethasMorePosts(true);
  }

  return (
    <div className={commonStyles.mainContainer}>
      <header className={styles.header}>
        <img src="/Logo.svg" alt="logo" />
      </header>

      {postsPagination.results.map(post => {
        return (
          <section key={post.uid} className={styles.post}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>

            <span>
              <FiCalendar /> {post.first_publication_date}
            </span>
            <span>
              <FiUser /> {post.data.author}
            </span>
          </section>
        );
      })}

      {postsPagination.next_page && (
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
      first_publication_date: post.first_publication_date,
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
