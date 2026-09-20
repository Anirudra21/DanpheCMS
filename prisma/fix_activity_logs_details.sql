BEGIN TRANSACTION;
DECLARE @df_name sysname;
SELECT @df_name = df.name
FROM sys.default_constraints df
JOIN sys.columns col ON col.default_object_id = df.object_id
JOIN sys.tables t ON t.object_id = col.object_id
WHERE t.name = 'activity_logs' AND col.name = 'details';
IF @df_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE activity_logs DROP CONSTRAINT ' + @df_name);
END
ALTER TABLE activity_logs ALTER COLUMN details NVARCHAR(MAX) NOT NULL;
IF @df_name IS NOT NULL
BEGIN
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_details_df DEFAULT ('') FOR details;
END
COMMIT;