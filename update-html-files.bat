@echo off
setlocal enabledelayedexpansion

rem List of HTML files to update
set FILES=about-me.html admin.html article.html articles.html test-supabase.html

rem Create a temporary file for the new header
(
    echo ^<header data-include-html="header.html"^>^</header^>
) > header.tmp

rem Update each HTML file
for %%f in (%FILES%) do (
    if exist "%%f" (
        echo Updating %%f
        
        rem Create a temporary file for the modified content
        (
            rem Copy the file up to the opening body tag
            for /f "tokens=1* delims=:" %%a in ('findstr /n "^" "%%f"') do (
                set "line=%%b"
                if not "!line!"=="" set "line=!line:^<=^<!"
                
                if not defined body_tag_found (
                    echo !line!
                    echo !line! | findstr /i "<body" >nul
                    if !errorlevel! equ 0 (
                        set body_tag_found=1
                        type header.tmp
                    )
                ) else (
                    echo !line!
                )
            )
        ) > "%%~nf_new.html"
        
        rem Replace the original file
        move /y "%%~nf_new.html" "%%f" >nul
        set "body_tag_found="
    )
)

del header.tmp
echo All files have been updated!
pause
