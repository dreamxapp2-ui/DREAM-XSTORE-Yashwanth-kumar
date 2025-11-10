'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Search, Eye, Ban, CheckCircle, Store } from 'lucide-react';
import { AdminService } from '@/src/lib/api/admin/adminService';
import { UserStatus } from '@/src/lib/api/admin/types';
import type { Customer } from '@/src/lib/api/admin/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCustomers();
  }, [statusFilter, currentPage]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getCustomers({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 20,
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCustomers();
  };

  const handleUpdateStatus = async (customerId: string, status: UserStatus) => {
    try {
      await AdminService.updateCustomerStatus(customerId, status);
      loadCustomers();
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  const handleMakeBrand = async (customerId: string) => {
    try {
      await AdminService.makeCustomerBrand(customerId);
      alert('Customer is now a brand');
      loadCustomers();
    } catch (error) {
      console.error('Failed to make customer a brand:', error);
      alert('Failed to make customer a brand');
    }
  };

  const handleRevokeBrand = async (customerId: string) => {
    try {
      await AdminService.revokeBrandStatus(customerId);
      alert('Brand status revoked');
      loadCustomers();
    } catch (error) {
      console.error('Failed to revoke brand status:', error);
      alert('Failed to revoke brand status');
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      banned: 'destructive',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Management
          </h2>
          <p className="text-gray-500 mt-1">Manage customer accounts</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={`${customer.firstName} ${customer.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {customer.firstName[0]}
                              {customer.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      {customer.isBrand ? (
                        <Badge className="bg-blue-100 text-blue-800">Brand</Badge>
                      ) : (
                        <Badge variant="secondary">Customer</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {customer.status === UserStatus.ACTIVE ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(customer.id, UserStatus.BANNED)
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : customer.status === UserStatus.BANNED ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleUpdateStatus(customer.id, UserStatus.ACTIVE)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unban
                          </Button>
                        ) : null}
                        {customer.isBrand ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            title="Revoke brand status"
                            onClick={() => handleRevokeBrand(customer.id)}
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            title="Make brand"
                            onClick={() => handleMakeBrand(customer.id)}
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2">Page {currentPage}</span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
