// Codes List Page Manager
class CodesListPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalCodes = 0;
        this.searchQuery = '';
        this.statusFilter = '';
        this.sortBy = 'created_desc';
        this.codes = [];
        this.deleteCodeId = null;

        this.elements = {
            // Search and filters
            searchInput: document.getElementById('searchInput'),
            statusFilter: document.getElementById('statusFilter'),
            sortBy: document.getElementById('sortBy'),
            refreshBtn: document.getElementById('refreshBtn'),

            // Table and states
            loadingState: document.getElementById('loadingState'),
            tableContainer: document.getElementById('tableContainer'),
            emptyState: document.getElementById('emptyState'),
            codesTableBody: document.getElementById('codesTableBody'),

            // Pagination
            paginationContainer: document.getElementById('paginationContainer'),
            showingFrom: document.getElementById('showingFrom'),
            showingTo: document.getElementById('showingTo'),
            totalCodesSpan: document.getElementById('totalCodes'),
            prevPageBtn: document.getElementById('prevPageBtn'),
            nextPageBtn: document.getElementById('nextPageBtn'),
            pageNumbers: document.getElementById('pageNumbers'),

            // Delete modal
            deleteModal: document.getElementById('deleteModal'),
            deleteCodeText: document.getElementById('deleteCodeText'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCodes();
    }

    setupEventListeners() {
        // Search and filters
        this.elements.searchInput.addEventListener('input', debounce(() => {
            this.searchQuery = this.elements.searchInput.value.trim();
            this.currentPage = 1;
            this.loadCodes();
        }, 300));

        this.elements.statusFilter.addEventListener('change', () => {
            this.statusFilter = this.elements.statusFilter.value;
            this.currentPage = 1;
            this.loadCodes();
        });

        this.elements.sortBy.addEventListener('change', () => {
            this.sortBy = this.elements.sortBy.value;
            this.currentPage = 1;
            this.loadCodes();
        });

        this.elements.refreshBtn.addEventListener('click', () => {
            this.loadCodes();
        });

        // Pagination
        this.elements.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadCodes();
            }
        });

        this.elements.nextPageBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadCodes();
            }
        });

        // Delete modal
        this.elements.cancelDeleteBtn.addEventListener('click', () => {
            this.hideDeleteModal();
        });

        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            this.deleteCode();
        });

        // Close modal on backdrop click
        this.elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) {
                this.hideDeleteModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.deleteModal.classList.contains('hidden')) {
                this.hideDeleteModal();
            }
        });
    }

    async loadCodes() {
        try {
            this.showLoading();

            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                search: this.searchQuery,
                status: this.statusFilter,
                sort: this.sortBy
            });

            const response = await authManager.apiCall(`/api/codes?${params}`);
            const data = await response.json();

            if (data.success) {
                this.codes = data.data.codes;
                this.totalCodes = data.data.total;
                this.totalPages = Math.ceil(this.totalCodes / this.pageSize);

                if (this.codes.length === 0) {
                    this.showEmptyState();
                } else {
                    this.renderTable();
                    this.renderPagination();
                    this.showTable();
                }
            } else {
                throw new Error(data.message || 'Không thể tải danh sách mã');
            }
        } catch (error) {
            console.error('Error loading codes:', error);
            authManager.showToast('Lỗi khi tải danh sách mã. Vui lòng thử lại.', 'error');
            this.showEmptyState();
        }
    }

    renderTable() {
        const tbody = this.elements.codesTableBody;
        tbody.innerHTML = '';

        this.codes.forEach(code => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-muted/50 transition-colors';

            const createdAt = formatDate(code.created_at);
            const usedAt = code.used_at ? formatDate(code.used_at) : '-';
            const statusBadge = code.is_used 
                ? '<span class="badge badge-destructive">Đã sử dụng</span>'
                : '<span class="badge badge-secondary">Chưa sử dụng</span>';

            row.innerHTML = `
                <td class="p-4">
                    <div class="font-mono font-semibold">${code.code}</div>
                </td>
                <td class="p-4">
                    ${statusBadge}
                </td>
                <td class="p-4">
                    <div class="text-sm">${createdAt}</div>
                </td>
                <td class="p-4">
                    <div class="text-sm">${usedAt}</div>
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-end gap-2">
                        <button class="btn btn-outline btn-sm download-qr-btn" data-code="${code.code}" title="Tải QR Code">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </button>
                        <button class="btn btn-outline btn-sm copy-code-btn" data-code="${code.code}" title="Copy mã">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                        </button>
                        <button class="btn btn-destructive btn-sm delete-code-btn" data-code="${code.code}" data-id="${code.id}" title="Xóa mã">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add event listeners for action buttons
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Download QR buttons
        document.querySelectorAll('.download-qr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                this.downloadQRCode(code);
            });
        });

        // Copy code buttons
        document.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                this.copyCode(code);
            });
        });

        // Delete code buttons
        document.querySelectorAll('.delete-code-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                const id = e.currentTarget.dataset.id;
                this.showDeleteModal(code, id);
            });
        });
    }

    renderPagination() {
        if (this.totalPages <= 1) {
            this.elements.paginationContainer.classList.add('hidden');
            return;
        }

        this.elements.paginationContainer.classList.remove('hidden');

        // Update showing info
        const from = (this.currentPage - 1) * this.pageSize + 1;
        const to = Math.min(this.currentPage * this.pageSize, this.totalCodes);
        
        this.elements.showingFrom.textContent = from;
        this.elements.showingTo.textContent = to;
        this.elements.totalCodesSpan.textContent = this.totalCodes;

        // Update prev/next buttons
        this.elements.prevPageBtn.disabled = this.currentPage === 1;
        this.elements.nextPageBtn.disabled = this.currentPage === this.totalPages;

        // Render page numbers
        this.renderPageNumbers();
    }

    renderPageNumbers() {
        const container = this.elements.pageNumbers;
        container.innerHTML = '';

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            this.addPageButton(1);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'px-3 py-2 text-sm text-muted-foreground';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            this.addPageButton(i);
        }

        // Add last page and ellipsis if needed
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'px-3 py-2 text-sm text-muted-foreground';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            }
            this.addPageButton(this.totalPages);
        }
    }

    addPageButton(pageNumber) {
        const button = document.createElement('button');
        button.className = pageNumber === this.currentPage 
            ? 'btn btn-default btn-sm' 
            : 'btn btn-outline btn-sm';
        button.textContent = pageNumber;
        button.addEventListener('click', () => {
            this.currentPage = pageNumber;
            this.loadCodes();
        });
        this.elements.pageNumbers.appendChild(button);
    }

    async downloadQRCode(code) {
        try {
            const response = await authManager.apiCall(`/api/generate-qr/${code}`);

            if (response.ok) {
                const blob = await response.blob();

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `qr-code-${code}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                authManager.showToast('Đã tải QR Code thành công', 'success');
            } else {
                throw new Error('Không thể tải QR Code');
            }
        } catch (error) {
            console.error('Error downloading QR code:', error);
            authManager.showToast('Lỗi khi tải QR Code', 'error');
        }
    }

    async copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            authManager.showToast('Đã copy mã vào clipboard', 'success');
        } catch (error) {
            console.error('Error copying code:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            authManager.showToast('Đã copy mã vào clipboard', 'success');
        }
    }

    showDeleteModal(code, id) {
        this.deleteCodeId = id;
        this.elements.deleteCodeText.textContent = code;
        this.elements.deleteModal.classList.remove('hidden');
        this.elements.deleteModal.classList.add('flex');
    }

    hideDeleteModal() {
        this.elements.deleteModal.classList.add('hidden');
        this.elements.deleteModal.classList.remove('flex');
        this.deleteCodeId = null;
    }

    async deleteCode() {
        if (!this.deleteCodeId) return;

        try {
            this.setDeleteLoading(true);

            const response = await authManager.apiCall(`/api/codes/${this.deleteCodeId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                authManager.showToast('Đã xóa mã thành công', 'success');
                this.hideDeleteModal();
                this.loadCodes(); // Reload the list
            } else {
                throw new Error(data.message || 'Không thể xóa mã');
            }
        } catch (error) {
            console.error('Error deleting code:', error);
            authManager.showToast('Lỗi khi xóa mã. Vui lòng thử lại.', 'error');
        } finally {
            this.setDeleteLoading(false);
        }
    }

    setDeleteLoading(loading) {
        const deleteText = this.elements.confirmDeleteBtn.querySelector('.delete-text');
        const deleteLoading = this.elements.confirmDeleteBtn.querySelector('.delete-loading');
        
        if (loading) {
            deleteText.classList.add('hidden');
            deleteLoading.classList.remove('hidden');
            this.elements.confirmDeleteBtn.disabled = true;
        } else {
            deleteText.classList.remove('hidden');
            deleteLoading.classList.add('hidden');
            this.elements.confirmDeleteBtn.disabled = false;
        }
    }

    showLoading() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.tableContainer.classList.add('hidden');
        this.elements.emptyState.classList.add('hidden');
        this.elements.paginationContainer.classList.add('hidden');
    }

    showTable() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.tableContainer.classList.remove('hidden');
        this.elements.emptyState.classList.add('hidden');
    }

    showEmptyState() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.tableContainer.classList.add('hidden');
        this.elements.emptyState.classList.remove('hidden');
        this.elements.paginationContainer.classList.add('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be ready
    function initCodesListPage() {
        if (window.authManager) {
            new CodesListPage();
        } else {
            setTimeout(initCodesListPage, 50);
        }
    }
    
    initCodesListPage();
});
