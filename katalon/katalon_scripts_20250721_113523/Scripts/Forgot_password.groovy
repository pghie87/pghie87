import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// Open browser and navigate to the login page
WebUI.openBrowser('')
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementVisible(findTestObject('Login_Page/link_ForgotPassword'), 10)

// Click on forgot password link
WebUI.click(findTestObject('Login_Page/link_ForgotPassword'))

// Verify we're on the forgot password page
WebUI.waitForElementVisible(findTestObject('ForgotPassword_Page/txt_Username'), 10)
WebUI.verifyElementPresent(findTestObject('ForgotPassword_Page/header_ResetPassword'), 5)

// Enter username for password reset
WebUI.setText(findTestObject('ForgotPassword_Page/txt_Username'), username)

// Click on Reset Password button
WebUI.click(findTestObject('ForgotPassword_Page/btn_ResetPassword'))

// Verify reset password success message is displayed
WebUI.waitForElementVisible(findTestObject('ForgotPassword_Page/msg_ResetLinkSent'), 10)
WebUI.verifyElementText(findTestObject('ForgotPassword_Page/msg_ResetLinkSent'), 'Reset Password link sent successfully')

// Capture screenshot of success message
WebUI.takeScreenshot('forgot_password_success.png')

// Click on the login link to return to login page
WebUI.click(findTestObject('ForgotPassword_Page/link_Login'))

// Verify we're back on the login page
WebUI.waitForElementVisible(findTestObject('Login_Page/txt_Username'), 10)

// Close browser
WebUI.closeBrowser()