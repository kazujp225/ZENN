'use client'

import Link from 'next/link'

export default function ScrapsGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/scraps" className="text-blue-600 hover:text-blue-800">
            ← スクラップ一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">スクラップの使い方ガイド</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 スクラップとは？</h2>
              <p className="text-gray-600 mb-4">
                スクラップは、まだ完成していないアイデアや質問、メモなどを気軽に投稿できる機能です。
                ブログ記事ほど形式的でなく、Twitterよりも長文で技術的な内容を共有できます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">✨ 特徴</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <div>
                    <strong>気軽に投稿</strong> - 完成度を気にせず、思いついたことをすぐに共有
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <div>
                    <strong>議論を促進</strong> - コメント機能で他のユーザーと意見交換
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <div>
                    <strong>後から編集可能</strong> - 議論を通じて内容をブラッシュアップ
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <div>
                    <strong>ステータス管理</strong> - 議論が終わったらクローズして整理
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚀 使い方</h2>
              <ol className="space-y-4 text-gray-600">
                <li>
                  <strong className="block mb-2">1. スクラップを作成</strong>
                  <p>「スクラップを作成」ボタンから新しいスクラップを作成します。タイトルと内容を入力するだけでOK。</p>
                </li>
                <li>
                  <strong className="block mb-2">2. 絵文字とタグを設定</strong>
                  <p>スクラップの内容を表す絵文字とトピックタグを設定して、見つけやすくしましょう。</p>
                </li>
                <li>
                  <strong className="block mb-2">3. 公開して議論</strong>
                  <p>公開後はコメントで他のユーザーと議論。新しい視点や解決策が見つかるかも。</p>
                </li>
                <li>
                  <strong className="block mb-2">4. 内容を更新</strong>
                  <p>議論を通じて得た知見を追記したり、内容を修正したりできます。</p>
                </li>
                <li>
                  <strong className="block mb-2">5. クローズ</strong>
                  <p>議論が終わったり、問題が解決したらスクラップをクローズして整理。</p>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 活用例</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">技術的な質問</h3>
                  <p className="text-sm text-blue-800">
                    実装で悩んでいることを投稿して、コミュニティの知見を集める
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">アイデアメモ</h3>
                  <p className="text-sm text-green-800">
                    新しいプロジェクトのアイデアを書き留めて、フィードバックをもらう
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">学習ログ</h3>
                  <p className="text-sm text-purple-800">
                    新しい技術の学習過程を記録して、同じ道を歩む人の参考に
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">バグ報告</h3>
                  <p className="text-sm text-orange-800">
                    遭遇したバグや問題を共有して、解決策を一緒に探す
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">📌 Tips</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Markdown形式で記述できるので、コードブロックや表も使えます</li>
                <li>• 画像もドラッグ&ドロップで簡単に挿入できます</li>
                <li>• @メンションで特定のユーザーに通知を送れます</li>
                <li>• ハッシュタグ（#）でトピックを追加できます</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-center">
              <Link
                href="/new/scrap"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                スクラップを作成する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}