BEGIN TRANSACTION;
DECLARE @df_name sysname;
SELECT @df_name = df.name
FROM sys.default_constraints df
JOIN sys.columns col ON col.default_object_id = df.object_id
JOIN sys.tables t ON t.object_id = col.object_id
WHERE t.name = 'jobs' AND col.name = 'description';
IF @df_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE jobs DROP CONSTRAINT ' + @df_name);
END
ALTER TABLE jobs ALTER COLUMN description NVARCHAR(MAX) NOT NULL;
IF @df_name IS NOT NULL
BEGIN
    ALTER TABLE jobs ADD CONSTRAINT jobs_description_df DEFAULT ('') FOR description;
END

DECLARE @df_name2 sysname;
SELECT @df_name2 = df.name
FROM sys.default_constraints df
JOIN sys.columns col ON col.default_object_id = df.object_id
JOIN sys.tables t ON t.object_id = col.object_id
WHERE t.name = 'jobs' AND col.name = 'requirements';
IF @df_name2 IS NOT NULL
BEGIN
    EXEC('ALTER TABLE jobs DROP CONSTRAINT ' + @df_name2);
END
ALTER TABLE jobs ALTER COLUMN requirements NVARCHAR(MAX) NOT NULL;
IF @df_name2 IS NOT NULL
BEGIN
    ALTER TABLE jobs ADD CONSTRAINT jobs_requirements_df DEFAULT ('') FOR requirements;
END
COMMIT;