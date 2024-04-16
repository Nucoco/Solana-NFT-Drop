import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import twitterLogo from '@/public/twitter-logo.svg';
import styles from '@/styles/Home.module.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const Home = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana && solana.isPhantom) {
        console.log('Phantom wallet found!');

        // ユーザーのウォレットに直接
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(`Connected with Public Key: ${response.publicKey.toString()}`);

        // ユーザーの公開鍵をstateとして保持
        setWalletAddress(response.publicKey.toString());
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  }

  // ウォレット未接続時のボタン
  const renderNotConnectedContainer = () => (
    <button
      className={`${styles.ctaButton} ${styles.connectWalletButton}`}
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  // コンポーネントの初期マウント時に、Phantom Walletの接続を確認
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    onLoad();
  }, []);

  return (
    <>
      <Head>
        <title>Candy Drop</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <div>
            <p className={styles.header}>🍭 Candy Drop</p>
            <p className={styles.subText}>NFT drop machine with fair mint</p>
            {!walletAddress && renderNotConnectedContainer()}
          </div>
          <div className={styles.footerContainer}>
            <Image
              alt="Twitter Logo"
              className={styles.twitterLogo}
              src={twitterLogo}
            />
            <a
              className={styles.footerText}
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
