import {
  fetchCandyMachine,
  safeFetchCandyGuard,
} from '@metaplex-foundation/mpl-candy-machine';
import { act, render, screen } from '@testing-library/react';

import CandyMachine from '@/components/CandyMachine';

// solanaと通信するモジュールをモック
jest.mock('@metaplex-foundation/mpl-candy-machine', () => ({
  fetchCandyMachine: jest.fn(),
  safeFetchCandyGuard: jest.fn(),
  mplCandyMachine: jest.fn(),
}));

jest.mock('@metaplex-foundation/mpl-essentials', () => ({
  setComputeUnitLimit: jest.fn(),
}));

jest.mock('@metaplex-foundation/mpl-token-metadata', () => ({
  mplTokenMetadata: jest.fn(),
}));

jest.mock('@metaplex-foundation/umi', () => ({
  Option: jest.fn(),
  publicKey: jest.fn(),
  some: jest.fn(),
}));

jest.mock('@metaplex-foundation/umi-bundle-defaults', () => ({
  createUmi: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
  }),
}));

jest.mock('@metaplex-foundation/umi-signer-wallet-adapters', () => ({
  walletAdapterIdentity: jest.fn(),
}));

jest.mock('@metaplex-foundation/umi-uploader-nft-storage', () => ({
  nftStorageUploader: jest.fn(),
}));

// 各種ブロックチェーン通信用関数の戻り値をモック
const mockCandyMachineData = {
  items: [],
  itemsRedeemed: 0,
  data: {
    itemsAvailable: 3,
  },
  mintAuthority: 'dummyPublicKey',
};

const mockCandyGuardPastData = {
  guards: {
    solPayment: {
      __option: 'Some',
      value: 0.1,
      destination: 'dummyDestination',
    },
    startDate: {
      __option: 'Some',
      value: {
        date: (Date.now() / 1000 - 60 * 60 * 24).toString(),
      },
    },
  },
};

const mockCandyGuardFutureData = {
  guards: {
    solPayment: {
      __option: 'Some',
      value: 0.1,
      destination: 'dummyDestination',
    },
    startDate: {
      __option: 'Some',
      value: {
        date: (Date.now() / 1000 + 60 * 60 * 24).toString(),
      },
    },
  },
};

describe('CandyMachine', () => {
  // ドロップ日が未来に設定されている場合
  describe('when drop date is in the future', () => {
    // fetchCandyMachine関数をモック
    (fetchCandyMachine as jest.Mock).mockImplementationOnce(() =>
      // 戻り値をモック
      Promise.resolve({
        ...mockCandyMachineData,
      }),
    );
    // safeFetchCandyGuard関数をモック
    (safeFetchCandyGuard as jest.Mock).mockImplementationOnce(() =>
      // 戻り値をモック（1日後）
      Promise.resolve({
        ...mockCandyGuardFutureData,
      }),
    );
    it('renders CountdownTimer', async () => {
      // テストのためにレンダリングして
      await act(async () => {
        render(<CandyMachine walletAddress={'mockAddress'} />);
      });

      // カウントダウンが表示されているか
      const textElement = screen.getByText(/Candy Drop Starting In/);
      expect(textElement).toBeInTheDocument();
      // ミントボタンが表示されていないか
      const buttonElement = screen.queryByRole('button', {
        name: /Mint NFT/i,
      });
      expect(buttonElement).not.toBeInTheDocument();
    });
  });

  // ドロップが過去日の時
  describe('when the drop date is set in the past', () => {
    (safeFetchCandyGuard as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ...mockCandyGuardPastData,
      }),
    );

    // ミントボタンの表示を確認
    it('should render a mint button', async () => {
      (fetchCandyMachine as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ...mockCandyMachineData,
        }),
      );

      await act(async () => {
        render(<CandyMachine walletAddress={'mockAddress'} />);
      });

      const buttonElement = screen.getByRole('button', {
        name: /Mint NFT/i,
      });
      expect(buttonElement).toBeInTheDocument();
    });

    // 売り切れ確認
    it('should render "Sold Out"', async () => {
      (fetchCandyMachine as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ...mockCandyMachineData,
          itemsRedeemed: 3,
        }),
      );

      await act(async () => {
        render(<CandyMachine walletAddress={'mockAddress'} />);
      });

      const textElement = screen.getByText(/Sold Out/i);
      expect(textElement).toBeInTheDocument();
      const buttonElement = screen.queryByRole('button', {
        name: /Mint NFT/i,
      });
      expect(buttonElement).not.toBeInTheDocument();
    });
  });
});
