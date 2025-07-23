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

// Open browser and navigate to the Orange HRM login page
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for the page to load
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_Login/input_Username'), 10)

// Log the test case being executed
WebUI.comment("Executing Forgot Password test case")

// Click on "Forgot your password" link
WebUI.click(findTestObject('Page_OrangeHRM_Login/p_ForgotPassword'))

// Verify Reset Password page is displayed
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPassword'), 10)
WebUI.verifyElementPresent(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPassword'), 5)
WebUI.verifyElementText(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPassword'), 'Reset Password')

// Enter username for password reset
WebUI.setText(findTestObject('Page_OrangeHRM_ForgotPassword/input_Username'), username)

// Click on Reset Password button
WebUI.click(findTestObject('Page_OrangeHRM_ForgotPassword/button_ResetPassword'))

// Verify reset password success message
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPasswordLink'), 10)
WebUI.verifyElementPresent(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPasswordLink'), 5)
WebUI.verifyElementText(findTestObject('Page_OrangeHRM_ForgotPassword/h6_ResetPasswordLink'), 'Reset Password link sent successfully')

// Take screenshot of the success page
WebUI.takeScreenshot('Reset_Password_Success_Screenshot.png')

// Click on Login link to return to the login page
WebUI.click(findTestObject('Page_OrangeHRM_ForgotPassword/button_Login'))

// Verify user is back at login page
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_Login/input_Username'), 10)

// Close browser
WebUI.closeBrowser()