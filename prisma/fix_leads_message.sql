BEGIN TRANSACTION;
DECLARE @df_name sysname;
SELECT @df_name = df.name
FROM sys.default_constraints df
JOIN sys.columns col ON col.default_object_id = df.object_id
JOIN sys.tables t ON t.object_id = col.object_id
WHERE t.name = 'leads' AND col.name = 'message';
IF @df_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE leads DROP CONSTRAINT ' + @df_name);
END
ALTER TABLE leads ALTER COLUMN message NVARCHAR(MAX) NOT NULL;
IF @df_name IS NOT NULL
BEGIN
    ALTER TABLE leads ADD CONSTRAINT leads_message_df DEFAULT ('') FOR message;
END
COMMIT;