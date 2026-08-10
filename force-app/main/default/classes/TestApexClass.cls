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
        'Classe para executar cÃ¡lculos e avaliaÃ§Ã£o de alÃ§adas de aprovaÃ§Ã£o de Oportunidade/CotaÃ§Ã£o.';

    // Japanese
    public static final String JAPANESE_TEXT =
        'ãã¼ã¿ã«ã¦ã¼ã¶ã¼ç»é²ã¨æ¿èªãã­ã»ã¹';

    // Georgian
    public static final String GEORGIAN_TEXT =
        'ááá á¢áááá¡ áááá®ááá ááááá¡ á áááá¡á¢á ááªáá áá áááá¢áááªááá';

    // Armenian
    public static final String ARMENIAN_TEXT =
        'ÕÕ¸ÖÕ¿Õ¡Õ¬Õ« ÖÕ£Õ¿Õ¾Õ¸Õ²Õ« Õ£ÖÕ¡Õ¶ÖÕ¸ÖÕ´ Ö Õ°Õ¡Õ½Õ¿Õ¡Õ¿Õ¸ÖÕ´';

    // Arabic
    public static final String ARABIC_TEXT =
        'ØªØ³Ø¬ÙÙ ÙØ³ØªØ®Ø¯Ù Ø§ÙØ¨ÙØ§Ø¨Ø© ÙØ¹ÙÙÙØ© Ø§ÙÙÙØ§ÙÙØ©';

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

        System.debug(
            'Portuguese: ' + PORTUGUESE_TEXT
        );

        System.debug(
            'Japanese: ' + JAPANESE_TEXT
        );

        System.debug(
            'Georgian: ' + GEORGIAN_TEXT
        );

        System.debug(
            'Armenian: ' + ARMENIAN_TEXT
        );

        System.debug(
            'Arabic: ' + ARABIC_TEXT
        );
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