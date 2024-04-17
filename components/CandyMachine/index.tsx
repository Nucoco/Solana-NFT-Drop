import { useEffect, useState } from 'react';import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from '@metaplex-foundation/mpl-candy-machine';
import type {
  CandyGuard as CandyGuardType,
  CandyMachine as CandyMachineType,
  StartDate as StartDateType,
} from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-essentials';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  Option,
  publicKey,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import type { Umi as UmiType } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage';

import candyMachineStyles from './CandyMachine.module.css';

import styles from '@/styles/Home.module.css';

type CandyMachineProps = {
  walletAddress: any;
};

const CandyMachine = (props: CandyMachineProps) => {
  const { walletAddress } = props;

  // Candy Machineのメタデータを状態変数に保持
  const [umi, setUmi] = useState<UmiType | undefined>(undefined);
  const [candyMachine, setCandyMachine] = useState<CandyMachineType | undefined>(undefined);
  const [candyGuard, setCandyGuard] = useState<CandyGuardType | null>(null);
  const [startDateString, setStartDateString] = useState<Date | undefined>(undefined);

  const getCandyMachineState = async () => {
    try {
      if (
        process.env.NEXT_PUBLIC_SOLANA_RPC_HOST &&
        process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
      ) {
        // Candy Machineと対話するためのUmiインスタンスを作成し、必要なプラグインを追加します。
        const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST)
          .use(walletAdapterIdentity(walletAddress))
          .use(nftStorageUploader())
          .use(mplTokenMetadata())
          .use(mplCandyMachine());
        // Candy Machineからメタデータを取得します。
        const candyMachine = await fetchCandyMachine(
          umi,
          publicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID),
        );
        const candyGuard = await safeFetchCandyGuard(
          umi,
          candyMachine.mintAuthority,
        );

        // 取得したデータをコンソールに出力します。
        console.log(`items: ${JSON.stringify(candyMachine.items)}`);
        console.log(`itemsAvailable: ${candyMachine.data.itemsAvailable}`);
        console.log(`itemsRedeemed: ${candyMachine.itemsRedeemed}`);
        if (candyGuard?.guards.startDate.__option !== 'None') {
          console.log(`startDate: ${candyGuard?.guards.startDate.value.date}`);

          const startDateString = new Date(Number(candyGuard?.guards.startDate.value.date) * 1000);
          console.log(`startDateString: ${startDateString}`);
        }
        if (candyGuard?.guards.startDate.__option !== 'None') {
          console.log(`startDate: ${candyGuard?.guards.startDate.value.date}`);

          const startDateString = new Date(Number(candyGuard?.guards.startDate.value.date) * 1000);
          console.log(`startDateString: ${startDateString}`);
          // local time zone
          // const startLocalDateString = new Date(Number(candyGuard?.guards.startDate.value.date) * 1000).toLocaleDateString();
          // const startLocalTimeString = new Date(Number(candyGuard?.guards.startDate.value.date) * 1000).toLocaleTimeString();
          // console.log(`startLocalDateString: ${startLocalDateString} ${startLocalTimeString}`); // startLocalDateString: 1/1/2023 9:00:00 AM

          // 取得したデータをstate変数に保存します。
          setStartDateString(startDateString);
        }

        // 取得したデータをstate変数に保存します。
        setUmi(umi);
        setCandyMachine(candyMachine);
        setCandyGuard(candyGuard);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCandyMachineState();
  }, []);

  return candyMachine && candyGuard ? (
    <div className={candyMachineStyles.machineContainer}>
      <p>{`Drop Date: ${startDateString}`}</p>
      <p>
        {`Items Minted: ${candyMachine.itemsRedeemed} / ${candyMachine.data.itemsAvailable}`}
      </p>
      <button className={`${styles.ctaButton} ${styles.mintButton}`}>
        Mint NFT
      </button>
    </div>
  ) : null;
};

export default CandyMachine;
