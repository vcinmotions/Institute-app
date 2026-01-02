// import React, { ReactNode } from "react";
 import { HTMLAttributes } from "react";

import React, {
  ReactNode,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";

type TableCellProps =
  | ({
      isHeader?: true;
      children: ReactNode;
      className?: string;
    } & ThHTMLAttributes<HTMLTableHeaderCellElement>)
  | ({
      isHeader?: false;
      children: ReactNode;
      className?: string;
    } & TdHTMLAttributes<HTMLTableDataCellElement>);


interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
// interface TableCellProps {
//   children: ReactNode; // Cell content
//   isHeader?: boolean; // If true, renders as <th>, otherwise <td>
//   className?: string; // Optional className for styling
// }


// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
// const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
//   return <tr className={className}>{children}</tr>;
// };

const TableRow: React.FC<TableRowProps> = ({ children, className, ...rest }) => {
  return <tr className={className} {...rest}>{children}</tr>;
};

// TableCell Component
// const TableCell: React.FC<TableCellProps> = ({
//   children,
//   isHeader = false,
//   className,
// }) => {
//   const CellTag = isHeader ? "th" : "td";
//   return <CellTag className={` ${className}`}>{children}</CellTag>;
// };

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  ...rest
}) => {
  if (isHeader) {
    return (
      <th className={className} {...(rest as ThHTMLAttributes<HTMLTableHeaderCellElement>)}>
        {children}
      </th>
    );
  }
  return (
    <td className={className} {...(rest as TdHTMLAttributes<HTMLTableDataCellElement>)}>
      {children}
    </td>
  );
};


export { Table, TableHeader, TableBody, TableRow, TableCell };
