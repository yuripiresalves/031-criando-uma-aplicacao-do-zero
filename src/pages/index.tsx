import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

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

export default function Home() {
  return (
    <div className={commonStyles.mainContainer}>
      <header className={styles.header}>
        <img src="/Logo.svg" alt="logo"/>
      </header>

      <section className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de ciclos de vida.</p>

        <span>
          <FiCalendar /> 15 Mar 2021
        </span>
        <span>
          <FiUser /> Joseph Oliveira
        </span>
      </section>

      <button type="button" className={styles.button}>Carregar mais posts</button>
            
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  // const postsResponse = await prismic.query(TODO);

  return {
    props: {
      
    }
  }
};
