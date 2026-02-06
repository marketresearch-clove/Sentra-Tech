import React, { useState } from 'react';
import { Edit, Trash2, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';

const CustomerList = ({ customers, loading, pagination, onPageChange }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: '活跃', class: 'bg-green-100 text-green-800' },
      new: { text: '新客户', class: 'bg-blue-100 text-blue-800' },
      inactive: { text: '非活跃', class: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
  };

  const handleDelete = (customerId) => {
    if (window.confirm('确定要删除这个客户吗？')) {
      // 这里应该调用API删除客户
      console.log('删除客户:', customerId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无客户数据
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left p-3 font-medium text-gray-700">客户信息</th>
            <th className="text-left p-3 font-medium text-gray-700">状态</th>
            <th className="text-left p-3 font-medium text-gray-700">最后联系</th>
            <th className="text-left p-3 font-medium text-gray-700">成交概率</th>
            <th className="text-left p-3 font-medium text-gray-700">操作</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-3">
                <div>
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone size={14} />
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail size={14} />
                      {customer.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                {getStatusBadge(customer.status)}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  {customer.lastContact}
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${getProbabilityColor(customer.probability)}`}
                      style={{ width: `${customer.probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {customer.probability}%
                  </span>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 分页控件 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            显示 {((pagination.currentPage - 1) * (pagination.perPage || 5)) + 1} - {Math.min(pagination.currentPage * (pagination.perPage || 5), pagination.totalItems)} 条，共 {pagination.totalItems} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm">
              第 {pagination.currentPage} / {pagination.totalPages} 页
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;