import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Coffee } from 'lucide-react';
import type { CoffeeBean } from '../types';

const BeansManagement = () => {
  const location = useLocation();
  
  // 서브 라우팅 처리
  if (location.pathname !== '/beans') {
    return (
      <Routes>
        <Route path="/list" element={<BeansList />} />
        <Route path="/add" element={<AddBean />} />
        <Route path="/edit/:id" element={<EditBean />} />
        <Route path="/sheets" element={<SheetsIntegration />} />
      </Routes>
    );
  }

  return <BeansList />;
};

const BeansList = () => {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 임시 데이터
    const mockBeans: CoffeeBean[] = [
      {
        id: '1',
        name: 'Addisu Hulichaye, Ethiopia',
        origin: 'Ethiopia',
        varieties: 'Heirloom',
        process: 'Natural',
        region: 'Yirgacheffe',
        altitude: '2000m',
        flavorNotes: ['Blueberry', 'Wine', 'Chocolate'],
        description: '에티오피아 예가체프 지역의 프리미엄 원두',
        story: '고도 2000m에서 자란 헤어룸 품종의 내추럴 프로세싱',
        nfcChipId: 'NFC001',
        customUrl: 'addisu-hulichaye-ethiopia',
        isActive: true,
        saleInfo: {
          price: 45000,
          isForSale: true,
          stock: 50
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        name: 'Geisha Panama',
        origin: 'Panama',
        varieties: 'Geisha',
        process: 'Washed',
        region: 'Boquete',
        altitude: '1600m',
        flavorNotes: ['Jasmine', 'Bergamot', 'Tropical Fruit'],
        description: '파나마 게이샤 품종의 최고급 원두',
        story: '세계에서 가장 비싼 커피 중 하나',
        nfcChipId: 'NFC002',
        customUrl: 'geisha-panama',
        isActive: true,
        saleInfo: {
          price: 120000,
          isForSale: true,
          stock: 20
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
      }
    ];

    setTimeout(() => {
      setBeans(mockBeans);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBeans = beans.filter(bean =>
    bean.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bean.origin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">원두 관리</h1>
          <p className="text-gray-600">커피 원두 정보를 관리합니다</p>
        </div>
        <Link
          to="/beans/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-coffee-600 hover:bg-coffee-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          원두 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500"
            placeholder="원두명 또는 원산지로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </button>
      </div>

      {/* 원두 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBeans.map((bean) => (
            <li key={bean.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-coffee-100 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-coffee-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{bean.name}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bean.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bean.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-600">
                        {bean.origin} • {bean.varieties} • {bean.process}
                      </p>
                      <p className="text-sm text-gray-500">
                        {bean.flavorNotes.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bean.saleInfo && (
                    <span className="text-sm font-medium text-gray-900">
                      ₩{bean.saleInfo.price.toLocaleString()}
                    </span>
                  )}
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coffee className="h-8 w-8 text-coffee-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 원두
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {beans.length}개
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    활성 원두
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {beans.filter(b => b.isActive).length}개
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">₩</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    판매 원두
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {beans.filter(b => b.saleInfo?.isForSale).length}개
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 임시 컴포넌트들
const AddBean = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900">원두 추가</h2>
    <p className="text-gray-600 mt-2">새로운 원두를 등록합니다</p>
  </div>
);

const EditBean = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900">원두 편집</h2>
    <p className="text-gray-600 mt-2">원두 정보를 수정합니다</p>
  </div>
);

const SheetsIntegration = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900">구글 시트 연동</h2>
    <p className="text-gray-600 mt-2">구글 시트와 데이터를 동기화합니다</p>
  </div>
);

export default BeansManagement; 