import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { describe } from 'node:test';

import CountdownTimer from '../components/CountdownTimer';

beforeEach(() => {
  // 実際のタイマー関数を、時間経過をコントロールできる関数でモックする
  jest.useFakeTimers();
  jest.spyOn(global, 'clearInterval');
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('CountdownTimer', () => {
  // ドロップ日までのカウントダウンが表示されるか
  it('should render the countdown timer', async () => {
    // テスト対象コンポーネントに渡すドロップ開始時間を1秒後に設定
    const dropDate = new Date(Date.now() + 1000 * 60 * 1);

    render(<CountdownTimer dropDate={dropDate} />);

    // 1秒進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // テスト
    const textElement = screen.getByText(/Candy Drop Starting In/);
    const textTimerElement = screen.getByText(/⏰ 0d 0h 0m 59s/);
    expect(textElement).toBeInTheDocument();
    expect(textTimerElement).toBeInTheDocument();
  });

  // ドロップ日が過ぎたらタイマーは表示されないか
  it('should clear the interval when the countdown reaches zero', () => {
    const dropDate = new Date(Date.now() + 1000 * 1);
    render(<CountdownTimer dropDate={dropDate} />);

    // 2秒進める
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // テスト
    const textElement = screen.queryByText(/⏰/);
    expect(textElement).toBeNull();
    expect(clearInterval).toHaveBeenCalled();
  });

  // アンマウントされた時にclearIntervalが呼び出されるか
  it('should clear the interval when the component unmounts', async () => {
    const dropDate = new Date(Date.now() + 1000 * 60 * 1);
    const { unmount } = render(<CountdownTimer dropDate={dropDate} />);

    // コンポーネントをアンマウントする
    unmount();

    // テスト
    expect(clearInterval).toHaveBeenCalled();
  });
});
