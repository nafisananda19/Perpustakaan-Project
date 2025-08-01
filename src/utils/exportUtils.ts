import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate the file name with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const fullFilename = `${filename}-${timestamp}.xlsx`;

    // Write the file
    XLSX.writeFile(workbook, fullFilename);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const formatDataForExport = {
  loans: (loans: any[]) => {
    return loans.map(loan => ({
      'Member Name': loan.member?.name || 'Unknown',
      'Book Title': loan.book?.title || 'Unknown',
      'Author': loan.book?.author || 'Unknown',
      'Loan Date': format(new Date(loan.loan_date), 'dd/MM/yyyy'),
      'Due Date': format(new Date(loan.return_date), 'dd/MM/yyyy'),
      'Return Date': loan.actual_return_date ? format(new Date(loan.actual_return_date), 'dd/MM/yyyy') : 'Not returned',
      'Status': loan.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan',
      'Fine': `Rp ${loan.fine || 0}`,
    }));
  },

  books: (books: any[]) => {
    return books.map(book => ({
      'Book Code': book.kode_buku || '-',
      'Title': book.title,
      'Author': book.author,
      'Category': book.category,
      'Total Copies': book.total_copies,
      'Available Copies': book.available_copies,
      'Added Date': format(new Date(book.added_date), 'dd/MM/yyyy'),
    }));
  },

  members: (members: any[]) => {
    return members.map(member => ({
      'Name': member.name,
      'Birth Place': member.birth_place,
      'Birth Date': format(new Date(member.birth_date), 'dd/MM/yyyy'),
      'Address': member.address,
      'Religion': member.religion,
      'Gender': member.gender,
      'Phone': member.phone,
      'Category': member.category === 'pelajar' ? 'Pelajar' : 'Umum',
      'Joined Date': format(new Date(member.created_at), 'dd/MM/yyyy'),
    }));
  },

  visitors: (visitors: any[]) => {
    return visitors.map(visitor => ({
      'Name': visitor.visitor?.name || visitor.name,
      'Address': visitor.visitor?.address || visitor.address,
      'Category': (visitor.visitor?.category || visitor.category) === 'anak-anak' ? 'Anak-anak' :
        (visitor.visitor?.category || visitor.category) === 'remaja' ? 'Remaja' : 'Dewasa',
      'Purpose': visitor.purpose === 'membaca' ? 'Membaca' :
        visitor.purpose === 'meminjam' ? 'Meminjam' :
          visitor.purpose === 'membaca_dan_meminjam' ? 'Membaca & Meminjam' : 'Lainnya',
      'Visit Date': visitor.visit_date ? format(new Date(visitor.visit_date), 'dd/MM/yyyy') : '',
      'Check In': visitor.checkin_time || '',
      'Check Out': visitor.checkout_time || 'Belum checkout',
    }));
  },
};