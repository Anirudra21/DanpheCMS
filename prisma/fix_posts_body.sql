BEGIN TRANSACTION;
DECLARE @df_name sysname;
SELECT @df_name = df.name
FROM sys.default_constraints df
JOIN sys.columns col ON col.default_object_id = df.object_id
JOIN sys.tables t ON t.object_id = col.object_id
WHERE t.name = 'posts' AND col.name = 'body';
IF @df_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE posts DROP CONSTRAINT ' + @df_name);
END
ALTER TABLE posts ALTER COLUMN body NVARCHAR(MAX) NOT NULL;
IF @df_name IS NOT NULL
BEGIN
    ALTER TABLE posts ADD CONSTRAINT posts_body_df DEFAULT ('') FOR body;
END
COMMIT;