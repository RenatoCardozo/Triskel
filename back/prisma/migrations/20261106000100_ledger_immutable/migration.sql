-- O livro de movimentações é imutável: nenhuma linha pode ser alterada ou apagada.
CREATE TRIGGER `LedgerEntry_no_update` BEFORE UPDATE ON `LedgerEntry` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LedgerEntry e imutavel';

CREATE TRIGGER `LedgerEntry_no_delete` BEFORE DELETE ON `LedgerEntry` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LedgerEntry e imutavel';
