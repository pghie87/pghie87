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

// Ensure we're logged in first
WebUI.callTestCase(findTestCase('Login_Test_Case'), ['username': 'Admin', 'password': 'admin123'], FailureHandling.STOP_ON_FAILURE)

// Click on user dropdown menu
WebUI.click(findTestObject('Object Repository/Page_OrangeHRM/span_User_Dropdown'))

// Wait for dropdown menu to appear
WebUI.waitForElementVisible(findTestObject('Object Repository/Page_OrangeHRM/a_Logout'), 5)

// Take screenshot of opened dropdown
WebUI.takeScreenshot('logout_dropdown.png')

// Click on logout
WebUI.click(findTestObject('Object Repository/Page_OrangeHRM/a_Logout'))

// Verify we're redirected to login page
WebUI.waitForElementVisible(findTestObject('Object Repository/Page_OrangeHRM/button_Login'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/button_Login'), 5)

// Take screenshot of login page after logout
WebUI.takeScreenshot('after_logout.png')

// Close browser
WebUI.closeBrowser()

WebUI.comment('Logout completed successfully')