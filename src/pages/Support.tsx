import React, { useEffect, useState, useMemo } from 'react';
import {
  Headphones,
  Send,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { SupportTicketDto } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const { addNotification } = useNotifications();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getTickets(page, pageSize);
      setTickets(res.items);
      setTotalCount(res.totalCount);
      if (res.items.length > 0 && !selectedTicket) {
        setSelectedTicket(res.items[0]);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل تذاكر الدعم الفني من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, pageSize]);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      await AdminService.addTicketMessage(selectedTicket.id, replyMessage);
      addNotification({
        type: 'success',
        title: 'تم الإرسال',
        message: 'تم إرسال الرد للعميل بنجاح',
      });
      setReplyMessage('');
      // Refresh current ticket
      const updated = await AdminService.getTicketById(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل إرسال الرد، يرجى المحاولة مرة أخرى',
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    try {
      await AdminService.resolveTicket(selectedTicket.id);
      addNotification({
        type: 'success',
        title: 'تم إغلاق التذكرة',
        message: 'تم تعيين حالة التذكرة كمكتملة ومغلقة بنجاح',
      });
      fetchTickets();
      setSelectedTicket((prev) => (prev ? { ...prev, status: 2 } : null));
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل إغلاق التذكرة',
      });
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.userName && t.userName.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === 'open') matchesStatus = t.status === 0 || t.status === 1;
      else if (statusFilter === 'resolved') matchesStatus = t.status === 2;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-7 h-7 text-rukoob-gold" />
            مركز الدعم الفني وتذاكر المساعدة
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة بلاغات المستخدمين، شكاوى الرحلات، والرد الفوري على الاستفسارات
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث التذاكر</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث برقم التذكرة، موضوع البلاغ، أو اسم المستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
          >
            <option value="all">جميع التذاكر</option>
            <option value="open">قيد المعالجة (Open)</option>
            <option value="resolved">تم الحل (Resolved)</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List with Pagination */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 overflow-hidden flex flex-col h-[650px]">
            <div className="p-3.5 bg-slate-50 dark:bg-rukoob-forest/30 border-b border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-cairo">
                التذاكر ({totalCount})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] ${statusFilter === 'all' ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold' : 'text-slate-500'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-2 py-0.5 rounded text-[11px] ${statusFilter === 'open' ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold' : 'text-slate-500'}`}
                >
                  مفتوحة
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1 custom-scrollbar">
              {loading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rukoob-gold mb-2" />
                  جاري تحميل التذاكر...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    لا توجد تذاكر تطابق الفلتر
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-rukoob-forest/10 dark:bg-rukoob-gold/15 border-rukoob-forest dark:border-rukoob-gold shadow-sm'
                          : 'bg-white dark:bg-rukoob-darker/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-rukoob-forest'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-rukoob-forest-light dark:text-rukoob-gold font-bold">
                              #{ticket.id.substring(0, 7)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {ticket.userName || 'مستخدم'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                            {ticket.subject}
                          </p>
                        </div>
                        {ticket.status === 2 ? (
                          <Badge variant="success" dot size="sm">مغلقة</Badge>
                        ) : (
                          <Badge variant="warning" dot size="sm">مفتوحة</Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize) || 1}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20]}
              className="p-3"
            />
          </div>
        </div>

        {/* Selected Ticket Conversation */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col h-[650px] overflow-hidden">
              {/* Ticket Topbar */}
              <div className="p-4 bg-slate-50 dark:bg-rukoob-forest/30 border-b border-slate-200 dark:border-rukoob-forest/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
                    <span>{selectedTicket.subject}</span>
                    <span className="font-mono text-xs text-rukoob-gold font-normal">
                      (#{selectedTicket.id.substring(0, 8)})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    مقدم من: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.userName || 'مستخدم المنظومة'}</strong> •{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>

                {selectedTicket.status !== 2 && (
                  <button
                    onClick={handleResolve}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>إغلاق التذكرة</span>
                  </button>
                )}
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Initial Description */}
                <div className="bg-slate-100 dark:bg-rukoob-dark p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-rukoob-forest-light dark:text-rukoob-gold">تفاصيل المشكلة الأصلية</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleTimeString('ar-EG')}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Follow-up Messages */}
                {selectedTicket.messages?.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      msg.isAdminResponse
                        ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark mr-8 shadow-sm'
                        : 'bg-slate-100 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 ml-8 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] opacity-80">
                      <span className="font-bold">{msg.isAdminResponse ? 'فريق الدعم (الأدمن)' : selectedTicket.userName}</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-slate-200 dark:border-rukoob-forest/30 bg-slate-50/50 dark:bg-rukoob-darker/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ردك للعميل هنا..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
                  />
                  <button
                    disabled={!replyMessage.trim()}
                    onClick={handleSendReply}
                    className="px-4 py-2.5 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">إرسال الرد</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 p-16 text-center text-slate-400 space-y-2">
              <Headphones className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">اختر تذكرة من القائمة لعرض المحادثة والرد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
