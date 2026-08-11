public with sharing class TestApexClass {

    private static final String PORTAL_ACCOUNT_ID = '001x000xxx35tPN';

    public String username { get; set; }
    public String email { get; set; }
    public String password { get; set; }
    public String confirmPassword { get; set; }
    public String communityNickname { get; set; }

    // Special symbols
    public static final String SPECIAL_SYMBOLS =
        '!@#$%^&*()_+-={}[]|:;<>,.?/~`';

    // Portuguese
    public static final String PORTUGUESE_TEXT =
        'Classe para executar cálculos e avaliação de alçadas de aprovação de Oportunidade/Cotação.';

    // Japanese
    public static final String JAPANESE_TEXT =
        'これは日本語のテキストです。承認プロセスをテストします。';

    // Georgian
    public static final String GEORGIAN_TEXT =
        'ქართული ტექსტი მომხმარებლის რეგისტრაციისა და დამტკიცებისთვის.';

    // Armenian
    public static final String ARMENIAN_TEXT =
        'Սա հայերեն տեքստ է օգտատիրոջ գրանցման և հաստատման համար։';

    // Arabic
    public static final String ARABIC_TEXT =
        'هذا نص عربي لاختبار تسجيل المستخدم وعملية الموافقة.';

    public TestApexClass() {
    }

    private Boolean isValidPassword() {
        if (password == null && confirmPassword == null) {
            return true;
        }

        if (password == null || confirmPassword == null) {
            return false;
        }

        return password.trim() == confirmPassword.trim();
    }

    public PageReference registerUser() {

        if (!isValidPassword()) {
            ApexPages.addMessage(
                new ApexPages.Message(
                    ApexPages.Severity.ERROR,
                    'Passwords do not match.'
                )
            );

            return null;
        }

        User u = new User();

        u.Username = username;
        u.Email = email;
        u.CommunityNickname = communityNickname;

        String cleanPassword;

        if (password != null) {
            cleanPassword = password.trim();
        }

        String userId = Site.createPortalUser(
            u,
            PORTAL_ACCOUNT_ID,
            cleanPassword
        );

        if (userId != null) {

            if (cleanPassword != null && cleanPassword.length() > 1) {
                return Site.login(
                    username,
                    cleanPassword,
                    null
                );
            }

            return new PageReference('/');
        }

        return null;
    }

    public static void testSpecialCharacters() {

        System.debug('Special Symbols: ' + SPECIAL_SYMBOLS);
        System.debug('Portuguese: ' + PORTUGUESE_TEXT);
        System.debug('Japanese: ' + JAPANESE_TEXT);
        System.debug('Georgian: ' + GEORGIAN_TEXT);
        System.debug('Armenian: ' + ARMENIAN_TEXT);
        System.debug('Arabic: ' + ARABIC_TEXT);
    }

    public static String evaluateApproval(Decimal opportunityAmount) {

        if (opportunityAmount == null) {
            return 'Amount is required';
        }

        if (opportunityAmount >= 1000000) {
            return 'Executive Approval';
        }

        if (opportunityAmount >= 500000) {
            return 'Senior Approval';
        }

        if (opportunityAmount >= 100000) {
            return 'Manager Approval';
        }

        return 'Standard Approval';
    }
}