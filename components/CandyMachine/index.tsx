import { useEffect } from 'react';
import {
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

  // CandyMachine/index.tsx
  useEffect(() => {
    getCandyMachineState();
  }, []);

  return (
    <div className={candyMachineStyles.machineContainer}>
      <p>Drop Date:</p>
      <p>Items Minted:</p>
      <button
        className={`${styles.ctaButton} ${styles.mintButton}`}
      >
        Mint NFT
      </button>
    </div>
  );
};

// CandyMachine/index.tsx
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
    }
  } catch (error) {
    console.error(error);
  }
};

export default CandyMachine;
