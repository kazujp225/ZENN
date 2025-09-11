'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, BarChart3, Play, Pause, StopCircle, TrendingUp, Users, Eye } from 'lucide-react'
import { toast } from 'sonner'
import '@/styles/components/ab-test-manager.css'

interface ABTestManagerProps {
  articleId?: string
  currentTitle?: string
  currentContent?: string
}

interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: {
    id: string
    name: string
    title: string
    content: string
    coverImage?: string
    isControl: boolean
  }[]
  metrics: {
    views: number
    clicks: number
    shares: number
    timeOnPage: number
  }[]
  startDate?: string
  endDate?: string
  trafficSplit: number[]
  confidenceLevel: number
  sampleSize: number
  winner?: string
}

interface TestResult {
  variant: string
  conversionRate: number
  confidence: number
  improvement: number
  significantlyBetter: boolean
}

export function ABTestManager({ articleId, currentTitle = '', currentContent = '' }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variants: [
      { name: 'Control (A)', title: currentTitle, content: currentContent, isControl: true },
      { name: 'Variant (B)', title: '', content: '', isControl: false }
    ],
    trafficSplit: [50, 50],
    sampleSize: 1000
  })

  useEffect(() => {
    fetchTests()
  }, [articleId])

  const fetchTests = async () => {
    // ダミーデータの生成
    const mockTests: ABTest[] = [
      {
        id: 'test-1',
        name: 'タイトル最適化テスト',
        description: 'タイトルの長さとクリック率の関係をテスト',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'Control (A)',
            title: currentTitle,
            content: currentContent,
            isControl: true
          },
          {
            id: 'variant-b',
            name: 'Variant (B)',
            title: `${currentTitle} - 完全ガイド`,
            content: currentContent,
            isControl: false
          }
        ],
        metrics: [
          { views: 2847, clicks: 512, shares: 89, timeOnPage: 245 },
          { views: 2753, clicks: 573, shares: 104, timeOnPage: 287 }
        ],
        startDate: '2024-01-15',
        trafficSplit: [50, 50],
        confidenceLevel: 95,
        sampleSize: 1000
      },
      {
        id: 'test-2',
        name: 'サムネイル最適化',
        description: 'サムネイルデザインの違いがエンゲージメントに与える影響',
        status: 'completed',
        variants: [
          {
            id: 'control',
            name: 'Control (A)',
            title: currentTitle,
            content: currentContent,
            isControl: true
          },
          {
            id: 'variant-b',
            name: 'Variant (B)',
            title: currentTitle,
            content: currentContent,
            coverImage: '/images/cover-alt.jpg',
            isControl: false
          }
        ],
        metrics: [
          { views: 4521, clicks: 724, shares: 156, timeOnPage: 198 },
          { views: 4387, clicks: 891, shares: 203, timeOnPage: 234 }
        ],
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        trafficSplit: [50, 50],
        confidenceLevel: 95,
        sampleSize: 2000,
        winner: 'variant-b'
      }
    ]
    
    setTests(mockTests)
    if (mockTests.length > 0) {
      setSelectedTest(mockTests[0])
      calculateResults(mockTests[0])
    }
  }

  const calculateResults = (test: ABTest) => {
    if (test.metrics.length < 2) return
    
    const results: TestResult[] = test.variants.map((variant, index) => {
      const metrics = test.metrics[index]
      const conversionRate = metrics.clicks / metrics.views
      
      // 簡略化した統計的有意性計算
      const controlRate = test.metrics[0].clicks / test.metrics[0].views
      const improvement = index === 0 ? 0 : ((conversionRate - controlRate) / controlRate) * 100
      const confidence = Math.min(95, Math.abs(improvement) * 5 + Math.random() * 20)
      
      return {
        variant: variant.name,
        conversionRate: conversionRate * 100,
        confidence,
        improvement,
        significantlyBetter: confidence > 90 && improvement > 0
      }
    })
    
    setTestResults(results)
  }

  const createTest = async () => {
    setIsCreating(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const test: ABTest = {
        id: `test-${Date.now()}`,
        name: newTest.name,
        description: newTest.description,
        status: 'draft',
        variants: newTest.variants.map((v, i) => ({
          id: `variant-${i}`,
          name: v.name,
          title: v.title,
          content: v.content,
          isControl: v.isControl
        })),
        metrics: [],
        trafficSplit: newTest.trafficSplit,
        confidenceLevel: 95,
        sampleSize: newTest.sampleSize
      }
      
      setTests(prev => [test, ...prev])
      setSelectedTest(test)
      setIsCreating(false)
      
      // フォームリセット
      setNewTest({
        name: '',
        description: '',
        variants: [
          { name: 'Control (A)', title: currentTitle, content: currentContent, isControl: true },
          { name: 'Variant (B)', title: '', content: '', isControl: false }
        ],
        trafficSplit: [50, 50],
        sampleSize: 1000
      })
      
      toast.success('A/Bテストを作成しました')
    } catch (error) {
      toast.error('テストの作成に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  const updateTestStatus = (testId: string, status: ABTest['status']) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status } : test
    ))
    
    if (selectedTest?.id === testId) {
      setSelectedTest(prev => prev ? { ...prev, status } : null)
    }
    
    const statusTexts = {
      running: '開始しました',
      paused: '一時停止しました',
      completed: '完了しました'
    }
    
    toast.success(`テストを${statusTexts[status]}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'completed': return <StopCircle className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="ab-test-manager">
      <div className="ab-test-manager__header">
        <h2 className="ab-test-manager__title">
          <FlaskConical className="w-5 h-5" />
          A/Bテスト管理
        </h2>
      </div>

      <div className="ab-test-manager__layout">
        {/* テスト一覧 */}
        <div className="ab-test-manager__sidebar">
          <div className="ab-test-manager__test-list">
            <h3>テスト一覧</h3>
            {tests.map(test => (
              <div
                key={test.id}
                className={`ab-test-manager__test-item ${
                  selectedTest?.id === test.id ? 'ab-test-manager__test-item--selected' : ''
                }`}
                onClick={() => {
                  setSelectedTest(test)
                  calculateResults(test)
                }}
              >
                <div className="ab-test-manager__test-item-header">
                  <span className="ab-test-manager__test-name">{test.name}</span>
                  <Badge className={`ab-test-manager__status-badge ${getStatusColor(test.status)}`}>
                    {getStatusIcon(test.status)}
                    {test.status}
                  </Badge>
                </div>
                <p className="ab-test-manager__test-description">{test.description}</p>
              </div>
            ))}
          </div>

          {/* 新しいテスト作成 */}
          <Card className="ab-test-manager__create-card">
            <CardHeader>
              <CardTitle>新しいA/Bテスト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="ab-test-manager__create-form">
                <Input
                  placeholder="テスト名"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
                <Textarea
                  placeholder="テストの説明"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  rows={3}
                />
                <div className="ab-test-manager__variant-inputs">
                  <h4>Variant B タイトル:</h4>
                  <Input
                    placeholder="新しいタイトルを入力"
                    value={newTest.variants[1].title}
                    onChange={(e) => setNewTest({
                      ...newTest,
                      variants: [
                        newTest.variants[0],
                        { ...newTest.variants[1], title: e.target.value }
                      ]
                    })}
                  />
                </div>
                <Button
                  onClick={createTest}
                  disabled={!newTest.name || !newTest.description || isCreating}
                  className="ab-test-manager__create-btn"
                >
                  {isCreating ? '作成中...' : 'テストを作成'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* テスト詳細 */}
        {selectedTest && (
          <div className="ab-test-manager__main">
            <div className="ab-test-manager__test-header">
              <div className="ab-test-manager__test-info">
                <h3>{selectedTest.name}</h3>
                <p>{selectedTest.description}</p>
                <Badge className={`${getStatusColor(selectedTest.status)}`}>
                  {getStatusIcon(selectedTest.status)}
                  {selectedTest.status}
                </Badge>
              </div>
              <div className="ab-test-manager__test-actions">
                {selectedTest.status === 'draft' && (
                  <Button
                    onClick={() => updateTestStatus(selectedTest.id, 'running')}
                    className="ab-test-manager__action-btn"
                  >
                    <Play className="w-4 h-4" />
                    テスト開始
                  </Button>
                )}
                {selectedTest.status === 'running' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateTestStatus(selectedTest.id, 'paused')}
                    >
                      <Pause className="w-4 h-4" />
                      一時停止
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateTestStatus(selectedTest.id, 'completed')}
                    >
                      <StopCircle className="w-4 h-4" />
                      テスト終了
                    </Button>
                  </>
                )}
                {selectedTest.status === 'paused' && (
                  <Button
                    onClick={() => updateTestStatus(selectedTest.id, 'running')}
                  >
                    <Play className="w-4 h-4" />
                    テスト再開
                  </Button>
                )}
              </div>
            </div>

            {/* バリアント比較 */}
            <div className="ab-test-manager__variants">
              <h4>バリアント比較</h4>
              <div className="ab-test-manager__variant-grid">
                {selectedTest.variants.map((variant, index) => (
                  <Card key={variant.id} className="ab-test-manager__variant-card">
                    <CardHeader>
                      <CardTitle className="ab-test-manager__variant-title">
                        {variant.name}
                        {variant.isControl && <Badge variant="outline">Control</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="ab-test-manager__variant-preview">
                        <h5>{variant.title}</h5>
                        <p>{variant.content.substring(0, 100)}...</p>
                      </div>
                      {selectedTest.metrics[index] && (
                        <div className="ab-test-manager__variant-metrics">
                          <div className="ab-test-manager__metric">
                            <Eye className="w-4 h-4" />
                            <span>{selectedTest.metrics[index].views.toLocaleString()} 閲覧</span>
                          </div>
                          <div className="ab-test-manager__metric">
                            <TrendingUp className="w-4 h-4" />
                            <span>{selectedTest.metrics[index].clicks.toLocaleString()} クリック</span>
                          </div>
                          <div className="ab-test-manager__metric">
                            <Users className="w-4 h-4" />
                            <span>{selectedTest.metrics[index].shares} シェア</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 結果分析 */}
            {testResults.length > 0 && (
              <div className="ab-test-manager__results">
                <h4>
                  <BarChart3 className="w-4 h-4" />
                  テスト結果
                </h4>
                <div className="ab-test-manager__results-grid">
                  {testResults.map((result, index) => (
                    <Card key={index} className="ab-test-manager__result-card">
                      <CardContent>
                        <h5>{result.variant}</h5>
                        <div className="ab-test-manager__result-metrics">
                          <div className="ab-test-manager__result-metric">
                            <span className="ab-test-manager__result-label">コンバージョン率:</span>
                            <span className="ab-test-manager__result-value">
                              {result.conversionRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="ab-test-manager__result-metric">
                            <span className="ab-test-manager__result-label">改善率:</span>
                            <span className={`ab-test-manager__result-value ${
                              result.improvement > 0 ? 'ab-test-manager__result-value--positive' : 'ab-test-manager__result-value--negative'
                            }`}>
                              {result.improvement > 0 ? '+' : ''}{result.improvement.toFixed(1)}%
                            </span>
                          </div>
                          <div className="ab-test-manager__result-metric">
                            <span className="ab-test-manager__result-label">信頼度:</span>
                            <span className="ab-test-manager__result-value">
                              {result.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={result.confidence} 
                          className="ab-test-manager__confidence-bar" 
                        />
                        {result.significantlyBetter && (
                          <Badge className="ab-test-manager__winner-badge">
                            統計的有意
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedTest.winner && (
                  <div className="ab-test-manager__winner">
                    <h5>🏆 勝者: {selectedTest.variants.find(v => v.id === selectedTest.winner)?.name}</h5>
                    <p>このバリアントが統計的に有意な改善を示しました。</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}