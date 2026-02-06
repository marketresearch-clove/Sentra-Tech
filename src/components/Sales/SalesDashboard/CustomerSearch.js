import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import CustomerList from './CustomerList';

const CustomerSearch = ({ onSearch }) => {
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // 假设的API函数，实际项目中应该从api文件导入
  const api = {
    get: async (url, params) => {
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟客户数据
          const allCustomers = [
            { id: 1, name: '李先生', phone: '13800000001', status: 'active', lastContact: '2024-12-19', probability: 85 },
            { id: 2, name: '王女士', phone: '13800000002', status: 'active', lastContact: '2024-12-18', probability: 72 },
            { id: 3, name: '张总', phone: '13800000003', status: 'new', lastContact: '2024-12-17', probability: 90 },
            { id: 4, name: '陈经理', phone: '13800000004', status: 'inactive', lastContact: '2024-12-10', probability: 45 },
            { id: 5, name: '刘董事长', phone: '13800000005', status: 'active', lastContact: '2024-12-19', probability: 88 },
          ];

          // 过滤逻辑
          let filteredCustomers = allCustomers;
          
          if (params.search) {
            filteredCustomers = filteredCustomers.filter(customer => 
              customer.name.includes(params.search) || customer.phone.includes(params.search)
            );
          }
          
          if (params.status) {
            filteredCustomers = filteredCustomers.filter(customer => 
              customer.status === params.status
            );
          }

          // 分页逻辑
          const totalItems = filteredCustomers.length;
          const totalPages = Math.ceil(totalItems / params.per_page);
          const startIndex = (params.page - 1) * params.per_page;
          const endIndex = startIndex + params.per_page;
          const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

          resolve({
            data: {
              data: paginatedCustomers,
              pagination: {
                currentPage: params.page,
                totalPages,
                totalItems
              }
            }
          });
        }, 500);
      });
    }
  };

  const searchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: rowsPerPage,
      };
      
      // 只添加非空的搜索参数
      if (searchName.trim()) {
        params.search = searchName.trim();
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      
      console.log('搜索参数:', params);
      
      const response = await api.get('/customers', { params });
      
      console.log('搜索返回的完整数据:', response.data);
      
      let results = [];
      if (response.data.data) {
        results = response.data.data;
      } else if (response.data.results) {
        results = response.data.results;
      } else if (Array.isArray(response.data)) {
        results = response.data;
      }
      
      console.log('设置的结果数据:', results);
      setResults(results);
      
      const pagination = response.data.pagination || {
        currentPage: response.data.current_page || 1,
        totalPages: response.data.total_pages || 1,
        totalItems: response.data.total || results.length
      };
      setPagination(pagination);
      
      onSearch(results);
    } catch (error) {
      console.error('搜索客户失败:', error);
      setResults([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      onSearch([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCustomers();
  }, [currentPage, rowsPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    searchCustomers();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索客户姓名或电话"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          <option value="active">活跃客户</option>
          <option value="new">新客户</option>
          <option value="inactive">非活跃客户</option>
        </select>

        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>每页5条</option>
          <option value={10}>每页10条</option>
          <option value={20}>每页20条</option>
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Search size={20} />
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      <CustomerList 
        customers={results} 
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CustomerSearch;