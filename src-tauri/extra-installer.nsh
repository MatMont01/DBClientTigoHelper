!include "LogicLib.nsh"

Section -ODBCDriverCheck
  ReadRegStr $0 HKLM "SOFTWARE\ODBC\ODBCINST.INI\ODBC Drivers" "ODBC Driver 17 for SQL Server"
  ${If} $0 == ""
    MessageBox MB_ICONINFORMATION "Instalando el driver ODBC de SQL Server necesario para la aplicación..."
    ExecWait '"$INSTDIR\python\SQL2022-SSEI-Expr.exe" /quiet IACCEPTMSODBCSQLLICENSETERMS=YES'
  ${EndIf}
SectionEnd